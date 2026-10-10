"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Brain,
  ShieldAlert,
  Loader2,
  Target,
  Clock,
  Briefcase,
  Copy,
  Check,
  Send,
  FileText,
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  generateBehavioralQuestions,
  evaluateBehavioralAnswer,
  saveBehavioralInterview,
} from "@/actions/interview";
import BehavioralDashboardSummary from "./behavioral-dashboard-summary";

export default function VoiceInterviewRunner({ initialRole = "" }) {
  // Session configuration & status
  const [targetRole, setTargetRole] = useState(
    initialRole || "Full Stack Software Engineer"
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Audio / Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Question evaluations & completed session
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [finalInterviewData, setFinalInterviewData] = useState(null);

  // Copied rewrite helper
  const [copiedRewrite, setCopiedRewrite] = useState(false);

  // Refs for Speech Recognition
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const textPrefixRef = useRef("");
  const restartTimerRef = useRef(null);

  // Keep isRecordingRef in sync with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Check speech recognition support on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSpeechSupported(false);
      }
    }

    return () => {
      stopRecording();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Initialize Speech Recognition
  const initSpeechRecognition = () => {
    if (typeof window === "undefined") return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let currentInterim = "";
        let currentFinal = "";

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript + " ";
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const prefix = textPrefixRef.current || "";
        const combined = (prefix + currentFinal + currentInterim).trim();
        if (combined) {
          setTranscript(combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn("[Speech] Recognition event error:", event.error);
        if (event.error === "no-speech") {
          // Normal pause in speech, will auto-restart in onend
          return;
        }
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microphone permission was not granted. You can type your answer directly.");
          stopRecording();
        } else if (event.error === "network") {
          toast.error("Browser speech service connection timeout. Please type your response directly.");
          stopRecording();
        } else if (event.error === "audio-capture") {
          toast.error("Could not capture microphone audio. Check your microphone or type your response.");
          stopRecording();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Ignore if already active
              }
            }
          }, 200);
        }
      };

      return recognition;
    } catch (e) {
      console.error("Failed to construct SpeechRecognition:", e);
      return null;
    }
  };

  // Start Mic
  const startRecording = async () => {
    try {
      textPrefixRef.current = transcript ? transcript.trim() + " " : "";

      // Cleanup existing recognition if any
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = initSpeechRecognition();
      if (!recognition) {
        toast.error("Speech recognition is not supported in this browser. Please type your answer directly.");
        return;
      }

      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      setIsRecording(true);
      recognition.start();
      toast.info("Microphone active! Speak clearly into your mic...");
    } catch (err) {
      console.error("Mic start error:", err);
      toast.error("Could not activate microphone. You can type your answer directly.");
      isRecordingRef.current = false;
      setIsRecording(false);
    }
  };

  // Stop Mic
  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    clearTimeout(restartTimerRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  // Helper to insert a high-quality sample STAR answer
  const handleFillSampleAnswer = () => {
    const sample = `In my previous project, we experienced a major disagreement between our engineering team and a key business stakeholder regarding technical trade-offs on the Q3 roadmap. The product manager wanted to deploy three new client features immediately, but our core API was suffering from high technical debt and latency spikes.

I took the initiative to set up a dedicated working session where I presented APM telemetry and simulated query load, demonstrating that adding features without query optimization would cause a 40% latency degradation under peak traffic. I proposed a phased compromise: we fast-tracked the highest-revenue feature for the current sprint while allocating 30% of engineering bandwidth to index and optimize the database bottlenecks.

As a result, we launched the critical feature on schedule, improved API response times by 45%, and established a weekly technical alignment sync that eliminated cross-team friction for future roadmap planning.`;
    setTranscript(sample);
    toast.success("Sample STAR response loaded! You can now click 'Evaluate Answer'.");
  };

  // Text-To-Speech for reading question
  const toggleSpeechQuestion = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Text-to-speech not supported in this browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    const currentQ = questions[currentIndex]?.question;
    if (!currentQ) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQ);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Start interview session: generate 5 behavioral questions
  const handleStartSession = async () => {
    setLoadingQuestions(true);
    try {
      const generated = await generateBehavioralQuestions(targetRole);
      if (generated && generated.length > 0) {
        setQuestions(generated);
        setHasStarted(true);
        setCurrentIndex(0);
        setTranscript("");
        setCurrentEvaluation(null);
        setCompletedQuestions([]);
        toast.success(`Prepared 5 behavioral questions for ${targetRole}!`);
      } else {
        throw new Error("No questions returned");
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
      toast.error("Failed to load questions. Please try again.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Evaluate current answer
  const handleEvaluateAnswer = async () => {
    const wordCount = transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0;
    if (wordCount < 4) {
      toast.error("Please provide a more detailed response (at least a few words explaining your answer).");
      return;
    }

    stopRecording();
    setIsEvaluating(true);

    try {
      const currentQ = questions[currentIndex];
      const evaluation = await evaluateBehavioralAnswer({
        transcript,
        question: currentQ.question,
        targetRole,
      });

      setCurrentEvaluation(evaluation);
      toast.success("Answer evaluated with STAR methodology!");
    } catch (error) {
      console.error("Evaluation error:", error);
      toast.error(error.message || "Failed to evaluate answer. Try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Proceed to next question or complete session
  const handleNextQuestion = async () => {
    if (!currentEvaluation) {
      toast.error("Please evaluate your answer before proceeding.");
      return;
    }

    const currentQ = questions[currentIndex];
    const recordedQuestionItem = {
      id: currentQ.id || currentIndex + 1,
      question: currentQ.question,
      category: currentQ.category,
      transcript: transcript.trim(),
      evaluation: currentEvaluation,
    };

    const updatedCompleted = [...completedQuestions, recordedQuestionItem];
    setCompletedQuestions(updatedCompleted);

    // If more questions remain, advance to next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTranscript("");
      setCurrentEvaluation(null);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingQuestion(false);
    } else {
      // All 5 questions completed -> Compute overall STAR score and save
      setIsSaving(true);
      try {
        const totalOverall = updatedCompleted.reduce(
          (sum, q) => sum + (q.evaluation?.scores?.overall || 0),
          0
        );
        const avgOverall = Number((totalOverall / updatedCompleted.length).toFixed(1));

        const avgSituation = Number(
          (
            updatedCompleted.reduce(
              (sum, q) => sum + (q.evaluation?.scores?.situation || 0),
              0
            ) / updatedCompleted.length
          ).toFixed(1)
        );

        const avgTask = Number(
          (
            updatedCompleted.reduce(
              (sum, q) => sum + (q.evaluation?.scores?.task || 0),
              0
            ) / updatedCompleted.length
          ).toFixed(1)
        );

        const avgAction = Number(
          (
            updatedCompleted.reduce(
              (sum, q) => sum + (q.evaluation?.scores?.action || 0),
              0
            ) / updatedCompleted.length
          ).toFixed(1)
        );

        const avgResult = Number(
          (
            updatedCompleted.reduce(
              (sum, q) => sum + (q.evaluation?.scores?.result || 0),
              0
            ) / updatedCompleted.length
          ).toFixed(1)
        );

        const avgClarity = Number(
          (
            updatedCompleted.reduce(
              (sum, q) => sum + (q.evaluation?.scores?.clarity || 0),
              0
            ) / updatedCompleted.length
          ).toFixed(1)
        );

        const starScores = {
          situation: avgSituation,
          task: avgTask,
          action: avgAction,
          result: avgResult,
          clarity: avgClarity,
        };

        const summaryData = {
          targetRole,
          overallScore: avgOverall,
          starScores,
          questions: updatedCompleted,
          feedback: `Candidate demonstrated solid behavioral competencies across ${updatedCompleted.length} questions with an average STAR score of ${avgOverall}/10. Key strengths include clear action-oriented delivery with opportunity to further sharpen measurable outcome metrics.`,
        };

        await saveBehavioralInterview(summaryData);
        setFinalInterviewData(summaryData);
        toast.success("Behavioral mock interview completed and saved!");
      } catch (err) {
        console.error("Save interview error:", err);
        toast.error("Failed to save interview to database.");
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Reset interview
  const handleRestart = () => {
    stopRecording();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setHasStarted(false);
    setFinalInterviewData(null);
    setCurrentIndex(0);
    setTranscript("");
    setCurrentEvaluation(null);
    setCompletedQuestions([]);
  };

  // Render Completed Summary
  if (finalInterviewData) {
    return (
      <BehavioralDashboardSummary
        interviewData={finalInterviewData}
        onRestart={handleRestart}
      />
    );
  }

  // Pre-Interview Setup Screen
  if (!hasStarted) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <Card className="border border-border shadow-xl bg-card overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Mic className="h-7 w-7" />
            </div>
            <CardTitle className="text-3xl font-extrabold tracking-tight gradient-title">
              Real-Time Voice Behavioral Mock Interview
            </CardTitle>
            <CardDescription className="text-base max-w-lg mx-auto">
              Simulate high-stakes executive behavioral interviews with live speech-to-text,
              STAR methodology scoring, filler word analysis, and AI model answers.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="targetRole" className="text-sm font-semibold">
                Target Role or Position
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer, Staff Product Manager..."
                  className="pl-9 text-base"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Questions and evaluation criteria will be tailored specifically to this role.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                  <Brain className="h-4 w-4" /> 5 Targeted Questions
                </div>
                <p className="text-xs text-muted-foreground">
                  Covers conflict resolution, leadership, failure, and execution under pressure.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                  <Mic className="h-4 w-4" /> Live Voice Transcription
                </div>
                <p className="text-xs text-muted-foreground">
                  Continuous browser speech-to-text with audio level visualizer and manual edit fallback.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 space-y-1">
                <div className="flex items-center gap-2 font-semibold text-xs text-primary">
                  <Target className="h-4 w-4" /> STAR Framework Scoring
                </div>
                <p className="text-xs text-muted-foreground">
                  1-10 scores on Situation, Task, Action, Result, plus filler word detection & rewritten answers.
                </p>
              </div>
            </div>

            {!isSpeechSupported && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Web Speech API is not natively supported in this browser. You can still type your responses or use Chrome/Edge for voice dictation.
                </span>
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-6 flex justify-center">
            <Button
              size="lg"
              onClick={handleStartSession}
              disabled={loadingQuestions || !targetRole.trim()}
              className="px-8 font-semibold text-base shadow-lg hover:shadow-primary/20"
            >
              {loadingQuestions ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions with Gemini AI...
                </>
              ) : (
                <>
                  Start Behavioral Interview
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Active Interview Runner Screen
  const currentQ = questions[currentIndex] || {};
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Runner Bar */}
      <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/60">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Role: <strong>{targetRole}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 sm:w-44 hidden sm:block">
            <Progress value={progressPercent} className="h-2" />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRestart}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Quit Interview
          </Button>
        </div>
      </div>

      {/* Main Question Card */}
      <Card className="border border-border/70 shadow-xl bg-card">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {currentQ.category || "Behavioral Competency"}
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSpeechQuestion}
              className={`h-8 text-xs gap-1.5 ${
                isSpeakingQuestion ? "border-primary text-primary animate-pulse" : ""
              }`}
            >
              {isSpeakingQuestion ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  Stop Voice
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  Listen to Question
                </>
              )}
            </Button>
          </div>

          <CardTitle className="text-2xl md:text-3xl font-bold leading-snug">
            {currentQ.question}
          </CardTitle>

          {currentQ.tip && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Coaching Tip:</strong> {currentQ.tip}
              </span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          {/* Recording & Audio Visualizer Status */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`relative flex items-center justify-center h-12 w-12 rounded-full border transition-all ${
                  isRecording
                    ? "bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {isRecording ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </div>

              <div>
                <p className="font-semibold text-sm">
                  {isRecording ? "Listening to your answer..." : "Microphone Idle"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRecording
                    ? "Speak clearly. Click Stop when finished."
                    : "Click Record to dictate or type in the box below."}
                </p>
              </div>
            </div>

            {/* Audio Waveform Bars Simulation */}
            {isRecording && (
              <div className="flex items-center gap-1.5 h-8 px-3 py-1 rounded-lg bg-background/80 border">
                {[10, 22, 14, 28, 16, 24, 12, 20].map((height, i) => (
                  <span
                    key={i}
                    className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                    style={{
                      height: `${height}px`,
                      animationDelay: `${i * 100}ms`,
                      animationDuration: "700ms",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Mic Action Buttons */}
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  disabled={isEvaluating}
                  className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium shadow"
                >
                  <Mic className="h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  variant="outline"
                  className="gap-2 border-rose-500 text-rose-500 hover:bg-rose-500/10 font-medium"
                >
                  <MicOff className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}

              {transcript && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTranscript("")}
                  className="text-xs text-muted-foreground"
                  disabled={isRecording || isEvaluating}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Spoken Response Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Your Spoken Response (Live Transcript)
              </span>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleFillSampleAnswer}
                  className="h-6 px-2 text-xs text-primary hover:text-primary gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Fill Sample Answer
                </Button>
                <span>
                  {transcript ? transcript.trim().split(/\s+/).filter(Boolean).length : 0} words
                </span>
              </div>
            </div>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here automatically. You may also type or refine your answer directly before submitting..."
              rows={5}
              className="text-sm font-sans resize-y leading-relaxed"
              disabled={isEvaluating}
            />
          </div>

          {/* Evaluate Action Button */}
          {!currentEvaluation && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleEvaluateAnswer}
                disabled={isEvaluating || !transcript.trim() || isRecording}
                size="lg"
                className="gap-2 font-semibold shadow-md"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing STAR Framework with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Evaluate Answer (STAR Criteria)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Evaluation Feedback Card */}
          {currentEvaluation && (
            <div className="space-y-5 p-5 rounded-2xl bg-gradient-to-b from-primary/10 via-primary/5 to-background border border-primary/20 shadow-xl animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    STAR Evaluation Results
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Detailed scoring for Question {currentIndex + 1}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black text-foreground">
                      {currentEvaluation.scores?.overall?.toFixed(1) || 0}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        / 10
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Question Score
                    </span>
                  </div>
                </div>
              </div>

              {/* STAR Dimension Badges */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-background/80 border">
                  <span className="text-muted-foreground text-[11px] block">
                    S - Situation
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {currentEvaluation.scores?.situation || 0}/10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border">
                  <span className="text-muted-foreground text-[11px] block">
                    T - Task
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {currentEvaluation.scores?.task || 0}/10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border">
                  <span className="text-muted-foreground text-[11px] block">
                    A - Action
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {currentEvaluation.scores?.action || 0}/10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border">
                  <span className="text-muted-foreground text-[11px] block">
                    R - Result
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {currentEvaluation.scores?.result || 0}/10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-background/80 border">
                  <span className="text-muted-foreground text-[11px] block">
                    Clarity
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    {currentEvaluation.scores?.clarity || 0}/10
                  </span>
                </div>
              </div>

              {/* Filler Words */}
              {currentEvaluation.fillerWords &&
                currentEvaluation.fillerWords.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                    <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Filler Words Detected (
                      {currentEvaluation.totalFillerCount || 0} total):
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentEvaluation.fillerWords.map((fw, fIdx) => (
                        <Badge
                          key={fIdx}
                          variant="destructive"
                          className="text-[11px]"
                        >
                          &quot;{fw.word}&quot; (x{fw.count})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {currentEvaluation.strengths?.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                      {currentEvaluation.strengths.map((s, sIdx) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEvaluation.improvements?.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                    <span className="font-semibold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> Key Growth Areas
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                      {currentEvaluation.improvements.map((imp, impIdx) => (
                        <li key={impIdx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Exemplary Rewritten Answer */}
              {currentEvaluation.rewrittenAnswer && (
                <div className="p-4 rounded-xl bg-background/90 border border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" /> Exemplary STAR Model
                      Answer
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          currentEvaluation.rewrittenAnswer
                        );
                        setCopiedRewrite(true);
                        toast.success("Model answer copied!");
                        setTimeout(() => setCopiedRewrite(false), 2000);
                      }}
                    >
                      {copiedRewrite ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs md:text-sm text-foreground/90 leading-relaxed italic">
                    &quot;{currentEvaluation.rewrittenAnswer}&quot;
                  </p>
                </div>
              )}

              {/* Next Question Navigation */}
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentEvaluation(null)}
                  className="text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Re-record Answer
                </Button>

                <Button
                  onClick={handleNextQuestion}
                  disabled={isSaving}
                  className="gap-2 font-semibold shadow-md px-6"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving
                      Interview...
                    </>
                  ) : currentIndex < questions.length - 1 ? (
                    <>
                      Next Question ({currentIndex + 2}/{questions.length})
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Complete & View Radar Dashboard
                      <Trophy className="h-4 w-4 text-amber-300" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
