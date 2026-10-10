"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Zap,
  HeartHandshake,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import AudioVisualizer from "./audio-visualizer";
import {
  converseLiveAgent,
  evaluateLiveInterviewSession,
} from "@/actions/live-agent";

const PERSONAS = [
  {
    id: "FAANG Engineering Lead",
    title: "FAANG Engineering Lead",
    subtitle: "Architecture & System Scalability",
    icon: Zap,
    badgeColor: "border-border text-foreground bg-muted/60",
    description: "Deep technical grilling, edge-case probing, scalability trade-offs, and zero patience for buzzwords.",
  },
  {
    id: "Empathetic HR Manager",
    title: "Empathetic HR Manager",
    subtitle: "Culture, EQ & Team Dynamics",
    icon: HeartHandshake,
    badgeColor: "border-border text-foreground bg-muted/60",
    description: "Behavioral probing, conflict resolution, emotional intelligence, and cross-functional alignment.",
  },
  {
    id: "Startup CTO",
    title: "Startup CTO",
    subtitle: "Speed, Ownership & Pragmatism",
    icon: Bot,
    badgeColor: "border-border text-foreground bg-muted/60",
    description: "Fast-moving, scrappy 80/20 trade-offs, product mindset, and extreme ownership.",
  },
];

export default function LiveAgentClient({ initialRole = "Senior Software Engineer" }) {
  // Session Configuration
  const [persona, setPersona] = useState("FAANG Engineering Lead");
  const [targetRole, setTargetRole] = useState(initialRole);
  const [callActive, setCallActive] = useState(false);

  // Conversation & Agent Lifecycle
  const [conversation, setConversation] = useState([]);
  const [currentCandidateInput, setCurrentCandidateInput] = useState("");
  const [agentStatus, setAgentStatus] = useState("idle"); // idle, listening, thinking, speaking
  const [isMuted, setIsMuted] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Speech Recognition Refs
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef(null);

  // Evaluation & Post-Session
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sessionReport, setSessionReport] = useState(null);

  // Format Elapsed Seconds
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  // Timer Effect
  useEffect(() => {
    if (callActive && !sessionReport) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive, sessionReport]);

  // Clean TTS on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      stopListening();
    };
  }, []);

  // Text-To-Speech for Interviewer Persona
  const speakAgentReply = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis || !ttsEnabled) {
      setAgentStatus("listening");
      startListening();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = persona === "Startup CTO" ? 1.05 : persona === "Empathetic HR Manager" ? 1.0 : 0.95;

    utterance.onstart = () => {
      setAgentStatus("speaking");
      stopListening();
    };

    utterance.onend = () => {
      setAgentStatus("listening");
      startListening();
    };

    utterance.onerror = () => {
      setAgentStatus("listening");
      startListening();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Initialize Speech Recognition
  const initRecognition = () => {
    if (typeof window === "undefined") return null;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + " ";
        }
        setCurrentCandidateInput(text.trim());
      };

      recognition.onerror = (e) => {
        if (e.error !== "no-speech") {
          console.warn("[LiveAgent] Speech error:", e.error);
        }
      };

      recognition.onend = () => {
        if (isListeningRef.current && callActive) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (err) {}
            }
          }, 200);
        }
      };

      return recognition;
    } catch (e) {
      return null;
    }
  };

  const startListening = () => {
    if (isMuted) return;
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      const rec = initRecognition();
      if (rec) {
        recognitionRef.current = rec;
        isListeningRef.current = true;
        rec.start();
      }
    } catch (e) {
      console.warn("Could not start recognition:", e);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Start Phone Call
  const handleStartCall = async () => {
    setCallActive(true);
    setElapsedSeconds(0);
    setConversation([]);
    setCurrentCandidateInput("");
    setSessionReport(null);
    setAgentStatus("thinking");

    toast.info(`Connecting live interview with ${persona}...`);

    try {
      const res = await converseLiveAgent({
        conversation: [],
        userMessage: "Hello, I am connected and ready for the interview.",
        persona,
        targetRole,
      });

      const reply = res.data?.replyText || `Hello! Thank you for joining. I will be your interviewer for the ${targetRole} position today. Could you walk me through an overview of your recent technical experience?`;

      const openingMessage = {
        role: "interviewer",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversation([openingMessage]);
      speakAgentReply(reply);
    } catch (err) {
      console.error("Start call error:", err);
      toast.error("Failed to connect live agent. Please try again.");
      setCallActive(false);
      setAgentStatus("idle");
    }
  };

  // Submit Candidate Response & Trigger Agent Follow-up
  const handleSendResponse = async (textToSend = null) => {
    const text = (textToSend || currentCandidateInput).trim();
    if (!text) {
      toast.warning("Please speak or enter your answer first.");
      return;
    }

    stopListening();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const candidateMsg = {
      role: "candidate",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedHistory = [...conversation, candidateMsg];
    setConversation(updatedHistory);
    setCurrentCandidateInput("");
    setAgentStatus("thinking");

    try {
      const res = await converseLiveAgent({
        conversation: updatedHistory,
        userMessage: text,
        persona,
        targetRole,
      });

      const reply = res.data?.replyText || "Interesting. Could you elaborate on what specific metrics you achieved?";

      const interviewerMsg = {
        role: "interviewer",
        text: reply,
        probingFocus: res.data?.probingFocus,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversation([...updatedHistory, interviewerMsg]);
      speakAgentReply(reply);
    } catch (err) {
      console.error("Agent reply error:", err);
      toast.error("Agent had trouble responding. Retrying...");
      setAgentStatus("listening");
      startListening();
    }
  };

  // End Call & Generate Evaluation Report
  const handleEndCall = async () => {
    stopListening();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCallActive(false);
    setAgentStatus("idle");

    if (conversation.length < 2) {
      toast.info("Session ended early. Need at least one complete exchange to generate an evaluation.");
      return;
    }

    setIsEvaluating(true);
    toast.info("Analyzing session transcript & scoring STAR competencies with Gemini...");

    try {
      const res = await evaluateLiveInterviewSession({
        conversation,
        persona,
        targetRole,
        durationSeconds: elapsedSeconds,
      });

      if (res.success) {
        setSessionReport(res.data);
        toast.success("Hiring Bar evaluation generated & saved to profile!");
      }
    } catch (err) {
      console.error("Evaluation generation error:", err);
      toast.error(err.message || "Failed to generate evaluation report.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Pre-fill Sample Response for testing
  const handleFillSample = () => {
    const samples = [
      "In my last role, we were designing a real-time event streaming pipeline using Kafka and Go. When our consumer lag began spiking past 4 seconds during flash sales, I profiled the ingestion worker and discovered lock contention on our PostgreSQL connection pool. I decoupled the ingestion layer by writing directly to Redis buffers with exponential backoff and batching DB inserts. This reduced latency from 4.2 seconds down to 85 milliseconds with 99.99% message durability.",
      "At my previous startup, our team of four had to deliver our multi-tenant SaaS authentication rewrite under a two-week security audit deadline. I prioritized minimal viable tokens using Clerk JWTs instead of building an in-house auth server from scratch, allowing us to ship on schedule with zero security vulnerabilities.",
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setCurrentCandidateInput(picked);
    toast.success("Sample response filled! Click 'Send Answer' or press Enter.");
  };

  // Render Post-Session Hiring Report
  if (sessionReport) {
    const score = sessionReport.overallScore || 7.5;
    const metrics = sessionReport.metrics || {};
    const recommendation = sessionReport.metrics?.hiringRecommendation || (score >= 8 ? "Strong Hire" : score >= 6.5 ? "Hire" : "Leaning No");

    const badgeColor =
      score >= 8
        ? "bg-primary/10 text-primary border-primary/30"
        : score >= 6.5
        ? "bg-muted text-foreground border-border"
        : "bg-destructive/10 text-destructive border-destructive/30";

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <Card className="border border-border shadow-xl bg-card overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-2 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Award className="h-7 w-7" />
            </div>
            <Badge variant="outline" className={`mx-auto mb-2 px-3 py-1 text-sm font-semibold ${badgeColor}`}>
              Hiring Bar Decision: {recommendation}
            </Badge>
            <CardTitle className="text-3xl font-extrabold gradient-title">
              Phone Screen Performance Debrief
            </CardTitle>
            <CardDescription className="text-base">
              Interviewer: <strong>{sessionReport.persona}</strong> · Target Role: <strong>{sessionReport.targetRole}</strong> · Duration: <strong>{formatTime(sessionReport.durationSeconds || 0)}</strong>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-muted/40 border text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Overall Rating</p>
                <p className="text-3xl font-black gradient-title">{score.toFixed(1)}/10</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Technical Depth</p>
                <p className="text-3xl font-bold text-foreground">{(metrics.technicalAccuracy || 7.5).toFixed(1)}/10</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Clarity & Brevity</p>
                <p className="text-3xl font-bold text-foreground">{(metrics.clarity || 8.0).toFixed(1)}/10</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border text-center space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Cadence (WPM)</p>
                <p className="text-3xl font-bold text-foreground">{metrics.pacingWpm || 135} wpm</p>
              </div>
            </div>

            {/* Executive Debrief Summary */}
            <div className="p-5 rounded-xl bg-muted/20 border space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> Interviewer Hiring Assessment
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {sessionReport.summaryFeedback}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border space-y-2.5">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Key Strengths Exhibited
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {sessionReport.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary shrink-0">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border space-y-2.5">
                <h4 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" /> Actionable Growth Areas
                </h4>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {sessionReport.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground shrink-0">•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Conversation Transcript Log */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Session Audio Transcript ({sessionReport.conversation?.length || 0} turns)</h4>
              <div className="max-h-72 overflow-y-auto space-y-3 p-4 rounded-xl bg-muted/30 border text-xs">
                {sessionReport.conversation?.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col space-y-1 p-2.5 rounded-lg ${
                      m.role === "interviewer"
                        ? "bg-muted/60 border border-border text-foreground"
                        : "bg-background border border-border text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>{m.role === "interviewer" ? `🎙️ ${sessionReport.persona}` : "👤 You"}</span>
                      <span>{m.timestamp || ""}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-3 pt-2 pb-6 border-t">
            <Button
              size="lg"
              onClick={() => {
                setSessionReport(null);
                setCallActive(false);
              }}
              className="gap-2 font-semibold shadow-lg"
            >
              <RotateCcw className="h-4 w-4" /> Start Another Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Pre-Call Setup Screen
  if (!callActive) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card className="border border-border shadow-xl bg-card overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Phone className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-3xl font-extrabold gradient-title">
              Live Phone Screen Interview Agent
            </CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              Simulate an intense, interactive audio phone screen with realistic turn-taking, active interruptions, and real-time behavioral probing.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Target Role Input */}
            <div className="space-y-2">
              <Label htmlFor="targetRole" className="font-semibold text-sm">Target Job Role</Label>
              <Input
                id="targetRole"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer, Staff Cloud Architect"
                className="h-11"
              />
            </div>

            {/* Persona Selector */}
            <div className="space-y-3">
              <Label className="font-semibold text-sm">Select Interviewer Persona</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = persona === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setPersona(p.id)}
                      className={`cursor-pointer rounded-xl p-4 border transition-all text-left space-y-2 ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                          : "border-border/70 hover:border-primary/40 bg-card/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-5 w-5 text-primary" />
                        <Badge variant="outline" className={`text-[10px] px-1.5 ${p.badgeColor}`}>
                          Active
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm leading-tight">{p.title}</h4>
                        <p className="text-[11px] text-muted-foreground">{p.subtitle}</p>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug line-clamp-3">
                        {p.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-muted-foreground">
              <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-primary" /> Hands-Free Turn Taking
                </span>
                <p>Natural back-and-forth speech synthesis with automatic pausing and listening.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Dynamic Follow-ups
                </span>
                <p>Probes deeper when answers lack metrics, architecture details, or STAR structure.</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Bar-Raiser Debrief
                </span>
                <p>Generates hiring recommendation, WPM metrics, and strengths breakdown.</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex justify-center">
            <Button
              size="lg"
              onClick={handleStartCall}
              disabled={!targetRole.trim()}
              className="px-8 font-semibold text-base shadow-lg gap-2"
            >
              <Phone className="h-5 w-5" />
              Dial In & Start Interview
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active Call Screen
  const statusLabel =
    agentStatus === "speaking"
      ? "AI Speaking..."
      : agentStatus === "thinking"
      ? "AI Evaluating & Probing..."
      : "Listening to Candidate...";

  const statusBadgeColor =
    agentStatus === "speaking"
      ? "border-primary/40 text-primary bg-primary/10"
      : agentStatus === "thinking"
      ? "border-border text-muted-foreground bg-muted"
      : "border-primary/40 text-primary bg-primary/10";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Phone Call Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{persona}</span>
              <Badge variant="outline" className={`text-xs ${statusBadgeColor}`}>
                {statusLabel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Role: <strong>{targetRole}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-mono font-semibold">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {formatTime(elapsedSeconds)}
          </div>

          <Button
            size="sm"
            variant="destructive"
            onClick={handleEndCall}
            disabled={isEvaluating}
            className="gap-1.5 font-semibold shadow"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Evaluating...
              </>
            ) : (
              <>
                <PhoneOff className="h-4 w-4" /> End Call & Score
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Waveform Canvas Visualizer */}
      <AudioVisualizer
        status={agentStatus}
        aiActive={agentStatus === "speaking"}
        candidateActive={agentStatus === "listening" && !!currentCandidateInput}
        className="shadow-2xl"
      />

      {/* Live Conversation Stream Card */}
      <Card className="border border-border/80 shadow-xl bg-card">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> Live Audio Feed & Dialogue
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className="h-8 text-xs gap-1 text-muted-foreground"
              >
                {ttsEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                {ttsEnabled ? "Voice Output ON" : "Muted"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Scrollable Conversation Bubble Stream */}
          <div className="max-h-80 overflow-y-auto space-y-3 p-3 rounded-xl bg-muted/20 border">
            {conversation.map((msg, idx) => {
              const isAI = msg.role === "interviewer";
              return (
                <div
                  key={idx}
                  className={`flex flex-col space-y-1 p-3 rounded-xl max-w-[85%] text-sm ${
                    isAI
                      ? "bg-muted/70 border border-border text-foreground self-start mr-auto"
                      : "bg-primary text-primary-foreground self-end ml-auto"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] opacity-80 mb-0.5">
                    <span className="font-semibold">{isAI ? `🎙️ ${persona}` : "👤 Candidate"}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.probingFocus && (
                    <span className="text-[10px] text-muted-foreground font-mono mt-1">
                      Focus: {msg.probingFocus}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Real-time Candidate Input & Dictation Area */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium flex items-center gap-1.5">
                <Mic className="h-3.5 w-3.5 text-primary animate-pulse" />
                Your Voice / Spoken Utterance
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFillSample}
                  className="h-6 px-2 text-xs text-primary gap-1"
                >
                  <Sparkles className="h-3 w-3" /> Sample Answer
                </Button>
                <span>{currentCandidateInput ? currentCandidateInput.split(/\s+/).filter(Boolean).length : 0} words</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={currentCandidateInput}
                onChange={(e) => setCurrentCandidateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendResponse();
                  }
                }}
                placeholder="Speak clearly into your microphone, or type your answer and press Enter..."
                className="h-12 text-sm"
                disabled={agentStatus === "thinking" || agentStatus === "speaking"}
              />

              <Button
                onClick={() => handleSendResponse()}
                disabled={!currentCandidateInput.trim() || agentStatus === "thinking" || agentStatus === "speaking"}
                className="h-12 px-5 gap-1.5 font-semibold"
              >
                <Send className="h-4 w-4" /> Send Answer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
