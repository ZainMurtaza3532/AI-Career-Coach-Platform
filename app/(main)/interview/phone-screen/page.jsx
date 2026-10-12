"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  ShieldCheck,
  Send,
  Loader2,
  Radio,
  FileText,
  User,
  Bot,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import useLiveVoiceInput from "@/hooks/useLiveVoiceInput";
import {
  conductPhoneScreenTurn,
  evaluatePhoneScreenSession,
} from "@/actions/interview";

export default function PhoneScreenPage() {
  // Session Configuration & Lifecycle
  const [targetRole, setTargetRole] = useState("Senior Full-Stack Engineer");
  const [candidateIndustry, setCandidateIndustry] = useState("Technology & Software");
  const [sessionId, setSessionId] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [status, setStatus] = useState("idle"); // "idle" | "ai_speaking" | "listening" | "thinking" | "evaluating" | "completed"
  const [ttsMuted, setTtsMuted] = useState(false);

  // Conversation history: Array of { role: "interviewer" | "candidate", text: string, timestamp: string, interimFeedback?: string }
  const [conversation, setConversation] = useState([]);
  const [turnCount, setTurnCount] = useState(0);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Final Session Report
  const [sessionReport, setSessionReport] = useState(null);
  const [isEvaluatingFinal, setIsEvaluatingFinal] = useState(false);

  // Waveform Canvases
  const aiCanvasRef = useRef(null);
  const userCanvasRef = useRef(null);
  const aiAnimRef = useRef(null);
  const userAnimRef = useRef(null);

  // Chat scroll container
  const chatScrollRef = useRef(null);

  // Manual fallback input state
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // ==========================================
  // Phase 1: Real-Time Dictation Hook
  // ==========================================
  const handleAutoPause = useCallback((committedText) => {
    if (callActive && status === "listening" && committedText.trim()) {
      handleCandidateSubmit(committedText);
    }
  }, [callActive, status]);

  const {
    isRecording,
    isPaused,
    isMuted,
    isSupported,
    audioLevel,
    isSpeaking,
    finalTranscript,
    interimTranscript,
    fullTranscript,
    silenceProgress,
    isSilenceCountdown,
    analyserNode,
    startListening,
    stopListening,
    toggleMute,
    resetTranscript,
  } = useLiveVoiceInput({
    lang: "en-US",
    silenceTimeoutMs: 2500,
    onAutoPause: handleAutoPause,
  });

  // Keep chat scrolled to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversation, fullTranscript]);

  // Duration timer
  useEffect(() => {
    if (callActive && status !== "completed") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive, status]);

  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // Web Speech Synthesis (Text-to-Speech)
  // ==========================================
  const speakAIResponse = useCallback((text, onFinishCallback) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      onFinishCallback?.();
      return;
    }

    if (ttsMuted) {
      setTimeout(() => {
        onFinishCallback?.();
      }, 1800);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria") ||
          v.name.includes("Jenny"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setStatus("ai_speaking");
      stopListening();
    };

    utterance.onend = () => {
      onFinishCallback?.();
    };

    utterance.onerror = () => {
      onFinishCallback?.();
    };

    window.speechSynthesis.speak(utterance);
  }, [stopListening, ttsMuted]);

  // Replay message audio
  const handleReplayAudio = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.startsWith("en"));
    if (naturalVoice) utterance.voice = naturalVoice;
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // Dual Audio Waveform Visualizers
  // ==========================================
  // 1. AI Waveform Canvas (sinusoidal pulse when AI is speaking)
  useEffect(() => {
    const canvas = aiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let step = 0;

    const renderAI = () => {
      step += 0.08;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      ctx.clearRect(0, 0, width, height);

      const isSpeaking = status === "ai_speaking";
      const amp = isSpeaking ? height * 0.38 : 3;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#4F46E5"); // Indigo
      gradient.addColorStop(0.5, "#818CF8");
      gradient.addColorStop(1, "#C084FC"); // Purple
      ctx.strokeStyle = gradient;

      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * 0.04 + step) * Math.sin(step * 0.5) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      aiAnimRef.current = requestAnimationFrame(renderAI);
    };

    renderAI();
    return () => cancelAnimationFrame(aiAnimRef.current);
  }, [status]);

  // 2. User Mic Waveform Canvas (Connected to real-time AnalyserNode)
  useEffect(() => {
    const canvas = userCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const renderUser = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (analyserNode && isRecording && !isMuted && !isPaused) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(4);
      }

      const barCount = 36;
      const barWidth = (width / barCount) * 0.65;
      const gap = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * bufferLength);
        let barHeight = (dataArray[index] / 255) * height * 0.85;
        barHeight = Math.max(barHeight, 4);

        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#F97316"); // Coral
        gradient.addColorStop(1, "#FDBA74");

        ctx.fillStyle = gradient;
        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [radius]);
        ctx.fill();
      }

      userAnimRef.current = requestAnimationFrame(renderUser);
    };

    renderUser();
    return () => cancelAnimationFrame(userAnimRef.current);
  }, [analyserNode, isRecording, isMuted, isPaused]);

  // ==========================================
  // Call Lifecycle: Start, Turn, End, Evaluate
  // ==========================================
  const handleStartPhoneScreen = async () => {
    const newSessionId = `ps_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setSessionId(newSessionId);
    setCallActive(true);
    setConversation([]);
    setElapsedSeconds(0);
    setTurnCount(1);
    setSessionReport(null);
    setStatus("thinking");

    toast.info("Connecting to Senior Talent Acquisition Lead...", { icon: "📞" });

    try {
      const res = await conductPhoneScreenTurn({
        sessionId: newSessionId,
        conversationHistory: [],
        candidateIndustry,
        targetRole,
      });

      const openingText =
        res.data?.aiSpokenResponse ||
        `Hi there! This is Sarah from Talent Acquisition. Thanks so much for hopping on the phone screen for the ${targetRole} position. To kick things off, could you give me a brief walkthrough of your background and key technical highlights?`;

      const openingMsg = {
        role: "interviewer",
        text: openingText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interimFeedback: res.data?.interimFeedback,
      };

      setConversation([openingMsg]);

      // Speak opening question then automatically start candidate dictation
      speakAIResponse(openingText, () => {
        setStatus("listening");
        startListening();
        toast.success("Sarah finished speaking. You may answer now!", { icon: "🎙️" });
      });
    } catch (err) {
      console.error("Start phone screen error:", err);
      toast.error("Connection failed. Please try starting the call again.");
      setCallActive(false);
      setStatus("idle");
    }
  };

  // Submit candidate response (from speech auto-pause or manual button)
  const handleCandidateSubmit = async (customCandidateText = null) => {
    const textToSend = (customCandidateText || fullTranscript || manualInput).trim();
    if (!textToSend) {
      toast.warning("Please speak into your microphone or enter your response.");
      return;
    }

    // Stop listening & reset draft
    stopListening();
    resetTranscript();
    setManualInput("");
    setStatus("thinking");

    const candidateMsg = {
      role: "candidate",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...conversation, candidateMsg];
    setConversation(updatedHistory);

    try {
      const res = await conductPhoneScreenTurn({
        sessionId,
        conversationHistory: updatedHistory,
        candidateIndustry,
        targetRole,
      });

      const reply = res.data?.aiSpokenResponse || "Thank you for that. How did you measure success on that project?";
      const isComplete = res.data?.isInterviewComplete || turnCount >= 5;

      const aiMsg = {
        role: "interviewer",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        interimFeedback: res.data?.interimFeedback,
      };

      const finalHistory = [...updatedHistory, aiMsg];
      setConversation(finalHistory);
      setTurnCount((prev) => prev + 1);

      speakAIResponse(reply, () => {
        if (isComplete) {
          handleConcludeAndEvaluate(finalHistory);
        } else {
          setStatus("listening");
          startListening();
        }
      });
    } catch (err) {
      console.error("Agent turn error:", err);
      toast.error("Interviewer turn failed. Retrying...");
      setStatus("listening");
      startListening();
    }
  };

  // Wrap up & generate final diagnostic score
  const handleConcludeAndEvaluate = async (finalConversationHistory = null) => {
    const history = finalConversationHistory || conversation;
    if (history.length < 2) {
      toast.warning("Interview ended before sufficient dialogue was recorded.");
      setCallActive(false);
      setStatus("idle");
      return;
    }

    stopListening();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setStatus("evaluating");
    setIsEvaluatingFinal(true);
    toast.info("Phone screen complete! Calculating STAR scoring & behavioral metrics...", {
      icon: "📊",
    });

    try {
      const evalRes = await evaluatePhoneScreenSession({
        sessionId,
        conversationHistory: history,
        candidateIndustry,
        targetRole,
        durationSeconds: elapsedSeconds,
      });

      if (evalRes.success && evalRes.data) {
        setSessionReport(evalRes.data);
        setStatus("completed");
        toast.success("Phone screen diagnostic report generated!");
      } else {
        throw new Error("Evaluation parsing failed");
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error("Evaluation failed to generate. Showing raw session summary.");
      setStatus("completed");
    } finally {
      setIsEvaluatingFinal(false);
    }
  };

  const handleEndCallEarly = () => {
    if (confirm("Are you sure you want to end this phone screen early and generate your diagnostic report?")) {
      handleConcludeAndEvaluate();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ==========================================
            SCREEN 1: Pre-Call Briefing & Configuration
        ========================================== */}
        {!callActive && !sessionReport && (
          <Card className="border border-slate-200 bg-white shadow-sm rounded-3xl overflow-hidden animate-fade-in">
            <CardHeader className="text-center pb-4 pt-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shadow-xs">
                <PhoneCall className="h-8 w-8 text-[#4F46E5] animate-pulse" />
              </div>
              <Badge variant="outline" className="mx-auto text-xs uppercase tracking-wider font-mono text-[#4F46E5] border-indigo-200 bg-indigo-50/50 mb-2">
                15-Minute Behavioral Screen
              </Badge>
              <CardTitle className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                AI Phone Screen Mock Interviewer
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mt-1.5">
                Simulate a real voice phone interview with Sarah, Senior Talent Acquisition Lead. Practice natural back-and-forth speech with live Speech-to-Text captioning.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 max-w-lg mx-auto pb-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Target Role
                </label>
                <Input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Industry / Domain
                </label>
                <Input
                  value={candidateIndustry}
                  onChange={(e) => setCandidateIndustry(e.target.value)}
                  placeholder="e.g. Technology & Cloud Infrastructure"
                  className="h-11 bg-slate-50 border-slate-200 text-slate-900 rounded-xl"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-[#F97316]" />
                  <span>How the Live Phone Screen Works</span>
                </div>
                <ul className="space-y-1.5 pl-5 list-disc text-slate-600">
                  <li><strong>Live Speech-to-Text:</strong> Words appear word-by-word on screen as you speak.</li>
                  <li><strong>Verbal AI Follow-ups:</strong> Sarah replies via natural speech and probes your STAR structure.</li>
                  <li><strong>Silence Detection:</strong> Pausing for 2.5s auto-commits your answer, or click Send Answer.</li>
                  <li><strong>Instant Diagnostic Scoring:</strong> Full evaluation with STAR rating, filler words, and strengths.</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pb-8 pt-0">
              <Button
                size="lg"
                onClick={handleStartPhoneScreen}
                className="w-full sm:w-auto bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold h-12 px-8 rounded-xl shadow-md gap-2 cursor-pointer transition-all text-base"
              >
                <PhoneCall className="h-5 w-5" />
                Start Phone Screen Call
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* ==========================================
            SCREEN 2: Active Phone Screen Call Interface
        ========================================== */}
        {callActive && !sessionReport && (
          <div className="space-y-5 animate-fade-in">
            {/* Header: Call Status & Controls */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
                  <PhoneCall className="h-6 w-6 text-[#4F46E5] animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">
                      Sarah • Senior Talent Acquisition
                    </h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Turn {turnCount}/5
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Screening for <strong>{targetRole}</strong>
                  </p>
                </div>
              </div>

              {/* Status Indicator & Call Timer */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span className="font-semibold">{formatTimer(elapsedSeconds)}</span>
                </div>

                <Badge
                  variant="outline"
                  className={`text-xs px-2.5 py-1 rounded-xl font-medium ${
                    status === "ai_speaking"
                      ? "border-indigo-300 text-[#4F46E5] bg-indigo-50 animate-pulse"
                      : status === "listening"
                      ? "border-[#F97316]/40 text-[#F97316] bg-[#F97316]/10 animate-pulse"
                      : status === "thinking"
                      ? "border-amber-300 text-amber-700 bg-amber-50"
                      : "border-emerald-300 text-emerald-700 bg-emerald-50"
                  }`}
                >
                  {status === "ai_speaking"
                    ? "AI Speaking..."
                    : status === "listening"
                    ? "Listening to You..."
                    : status === "thinking"
                    ? "AI Thinking..."
                    : "Connected"}
                </Badge>

                {/* Speaker Toggle */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTtsMuted(!ttsMuted)}
                  className="h-10 w-10 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900"
                  title={ttsMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                >
                  {ttsMuted ? <VolumeX className="h-4 w-4 text-amber-600" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                {/* End Call Button */}
                <Button
                  variant="outline"
                  onClick={handleEndCallEarly}
                  disabled={isEvaluatingFinal}
                  className="h-10 px-4 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-semibold gap-1.5"
                >
                  <PhoneOff className="h-4 w-4" />
                  <span>End Interview</span>
                </Button>
              </div>
            </div>

            {/* Dual Waveform Visualizer Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              {/* Top Wave: AI Interviewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5 text-[#4F46E5]" />
                    <span className="font-mono text-[11px] text-slate-700">AI INTERVIEWER AUDIO</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {status === "ai_speaking" ? "Active Spoken Output" : "Idle"}
                  </span>
                </div>
                <div className="h-12 w-full bg-slate-50/80 rounded-xl border border-slate-200/70 overflow-hidden flex items-center justify-center px-2">
                  <canvas ref={aiCanvasRef} width={640} height={48} className="w-full h-full block" />
                </div>
              </div>

              {/* Bottom Wave: Candidate Microphone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Mic className="h-3.5 w-3.5 text-[#F97316]" />
                    <span className="font-mono text-[11px] text-slate-700">YOUR MICROPHONE STREAM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      Level: {audioLevel}%
                    </span>
                    <div className="w-14 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4F46E5] to-[#F97316] transition-all duration-75"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="h-12 w-full bg-slate-50/80 rounded-xl border border-slate-200/70 overflow-hidden flex items-center justify-center px-2">
                  <canvas ref={userCanvasRef} width={640} height={48} className="w-full h-full block" />
                </div>
              </div>
            </div>

            {/* Live Transcript Dialogue Feed */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
                  <FileText className="h-4 w-4 text-[#4F46E5]" /> Phone Screen Dialogue Feed
                </span>
                <span className="text-slate-500 font-mono text-[11px]">
                  {conversation.length} exchange(s) recorded
                </span>
              </div>

              {/* Chat Bubble Stream */}
              <div
                ref={chatScrollRef}
                className="max-h-[340px] overflow-y-auto space-y-4 pr-1 scroll-smooth"
              >
                {conversation.map((msg, idx) => {
                  const isAI = msg.role === "interviewer";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col space-y-1.5 p-4 rounded-2xl text-sm leading-relaxed ${
                        isAI
                          ? "bg-slate-50 border border-slate-200/80 text-slate-900 mr-auto max-w-[90%]"
                          : "bg-indigo-50 border border-indigo-200/80 text-slate-900 ml-auto max-w-[90%]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs opacity-75 font-medium pb-1 border-b border-black/5">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                          {isAI ? (
                            <>
                              <Bot className="h-3.5 w-3.5 text-[#4F46E5]" /> Sarah (Talent Lead)
                            </>
                          ) : (
                            <>
                              <User className="h-3.5 w-3.5 text-indigo-700" /> You (Candidate)
                            </>
                          )}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{msg.timestamp}</span>
                          {isAI && (
                            <button
                              type="button"
                              onClick={() => handleReplayAudio(msg.text)}
                              className="text-[#4F46E5] hover:underline flex items-center gap-0.5 cursor-pointer ml-1"
                              title="Replay Audio"
                            >
                              <Volume2 className="h-3 w-3" /> Replay
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {msg.interimFeedback && isAI && (
                        <div className="pt-1 mt-1 text-[11px] text-indigo-700 font-medium flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                          <span>Assessment note: {msg.interimFeedback}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Candidate In-Flight Live Utterance Bubble */}
                {status === "listening" && (fullTranscript || interimTranscript) && (
                  <div className="flex flex-col space-y-1.5 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-sm leading-relaxed ml-auto max-w-[90%] animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 pb-1 border-b border-indigo-100">
                      <span className="flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-[#F97316] animate-pulse" /> Transcribing Live...
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-slate-900">
                      <span>{finalTranscript}</span>
                      {interimTranscript && (
                        <span className="text-slate-400 italic ml-1 inline-flex items-center">
                          {interimTranscript}
                          <span className="inline-block w-1.5 h-4 ml-1 bg-[#F97316] rounded-full animate-pulse" />
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Silence Auto-Commit Progress Bar */}
              {isSilenceCountdown && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs animate-fade-in">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span>Silence detected — auto-submitting answer in 2.5s...</span>
                  </div>
                  <div className="w-32 h-2 bg-amber-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F97316] transition-all duration-75"
                      style={{ width: `${silenceProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Real-Time Audio Dictation Controls */}
            <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {/* Mic Toggle Button with Pulsing Halo */}
                  <div className="relative">
                    {isRecording && !isMuted && !isPaused && (
                      <span className="absolute -inset-1 rounded-full bg-[#F97316] opacity-30 animate-ping" />
                    )}
                    <Button
                      onClick={isRecording ? stopListening : startListening}
                      className={`relative font-semibold h-11 px-5 rounded-xl shadow-xs transition-all gap-2 cursor-pointer ${
                        isRecording
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" /> Stop Mic
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" /> Start Speaking
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Mute Button */}
                  {isRecording && (
                    <Button
                      variant="outline"
                      onClick={toggleMute}
                      className={`h-11 px-4 rounded-xl text-xs sm:text-sm font-medium ${
                        isMuted
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-slate-200 text-slate-700 bg-white"
                      }`}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 mr-1 text-amber-600" /> : <Volume2 className="h-4 w-4 mr-1" />}
                      {isMuted ? "Unmute Mic" : "Mute Mic"}
                    </Button>
                  )}

                  {/* Manual Type Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    {showManualInput ? "Hide Textbox" : "Type Answer Instead"}
                  </Button>
                </div>

                {/* Primary Action: Send Answer / Next Question */}
                <Button
                  onClick={() => handleCandidateSubmit()}
                  disabled={status === "thinking" || status === "ai_speaking" || (!fullTranscript.trim() && !manualInput.trim())}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold h-11 px-6 rounded-xl shadow-md gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Answer / Next Question</span>
                  <span className="hidden sm:inline-block ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                    Ctrl+↵
                  </span>
                </Button>
              </div>

              {/* Optional Manual Text Override */}
              {showManualInput && (
                <div className="pt-2 flex gap-2 animate-fade-in">
                  <Input
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleCandidateSubmit();
                      }
                    }}
                    placeholder="Type or edit your response manually and press Enter..."
                    className="h-10 text-sm bg-slate-50 border-slate-200"
                  />
                  <Button
                    onClick={() => handleCandidateSubmit()}
                    disabled={!manualInput.trim()}
                    className="h-10 px-4 bg-slate-800 hover:bg-slate-900 text-white"
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
            SCREEN 3: Final Assessment & Diagnostic Scoring
        ========================================== */}
        {sessionReport && (
          <div className="space-y-6 animate-fade-in">
            <Card className="border border-slate-200 bg-white shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-4 pt-8">
                <div className="mx-auto mb-3 h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <Badge variant="outline" className="mx-auto text-xs uppercase tracking-wider font-mono text-emerald-700 border-emerald-200 bg-emerald-50 mb-2">
                  Session Completed • {formatTimer(elapsedSeconds)}
                </Badge>
                <CardTitle className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Phone Screen Diagnostic Scorecard
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto">
                  Comprehensive STAR methodology and vocal behavior analysis for {targetRole}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 p-6 sm:p-8">
                {/* Top Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-xs uppercase font-semibold text-slate-500 font-mono">Overall Score</span>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {sessionReport.overallScore}/10
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center">
                    <span className="text-xs uppercase font-semibold text-indigo-700 font-mono">STAR Rating</span>
                    <div className="text-3xl font-black text-[#4F46E5] mt-1">
                      {sessionReport.starStructureScore}/10
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-xs uppercase font-semibold text-slate-500 font-mono">Conciseness</span>
                    <div className="text-3xl font-black text-slate-900 mt-1">
                      {sessionReport.concisenessScore}/10
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-xs uppercase font-semibold text-amber-800 font-mono">Filler Words</span>
                    <div className="text-3xl font-black text-amber-600 mt-1">
                      ~{sessionReport.fillerWordCount}
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#4F46E5]" /> Executive Feedback & Summary
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {sessionReport.summaryFeedback}
                  </p>
                </div>

                {/* Best Answer Highlight & Area for Improvement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Best Answer Highlight
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{sessionReport.bestAnswerHighlight}"
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-rose-600" /> Key Strategic Improvement
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {sessionReport.areaForImprovement}
                    </p>
                  </div>
                </div>

                {/* Strengths & Actionable Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-[#4F46E5]" /> Observed Strengths
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {sessionReport.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#F97316]" /> Action Items Before Real Phone Screen
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {sessionReport.improvements?.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="h-3.5 w-3.5 text-[#F97316] mt-0.5 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center pb-8 pt-2">
                <Button
                  size="lg"
                  onClick={() => {
                    setSessionReport(null);
                    setCallActive(false);
                    setConversation([]);
                  }}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold px-8 h-12 rounded-xl shadow-md gap-2"
                >
                  <RotateCcw className="h-4 w-4" /> Start Another Phone Screen Call
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
