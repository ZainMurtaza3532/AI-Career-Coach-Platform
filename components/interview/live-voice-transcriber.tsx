"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  Send,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Globe,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings2,
  ChevronDown,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// Web Speech API TypeScript Declarations
// ==========================================

interface SpeechRecognitionErrorEvent extends Event {
  readonly error:
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported";
  readonly message?: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onaudioend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror:
    | ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void)
    | null;
  onresult:
    | ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void)
    | null;
  onspeechstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// ==========================================
// Component Props Interface
// ==========================================

export interface LiveVoiceTranscriberProps {
  /** Called whenever text updates (confirmed, interim, or full combined text) */
  onTranscriptChange?: (text: {
    final: string;
    interim: string;
    full: string;
  }) => void;
  /** Explicit callback when the answer is sent manually or auto-committed after silence */
  onSendAnswer?: (committedTranscript: string) => void;
  /** Initial transcript seed text */
  initialTranscript?: string;
  /** Custom placeholder displayed before speaking */
  placeholder?: string;
  /** Whether automatic commit after pause is enabled by default (default: true) */
  enableSilenceDetection?: boolean;
  /** Silence threshold in milliseconds to auto-commit (default: 2500ms) */
  silenceTimeoutMs?: number;
  /** Auto-start microphone on mount (default: false) */
  autoStart?: boolean;
  /** Initial language code (default: 'en-US') */
  defaultLanguage?: string;
  /** Additional container class names */
  className?: string;
}

// Supported recognition languages
const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "es-US", label: "Spanish (United States)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "ur-PK", label: "Urdu (Pakistan)" },
  { code: "hi-IN", label: "Hindi (India)" },
];

export default function LiveVoiceTranscriber({
  onTranscriptChange,
  onSendAnswer,
  initialTranscript = "",
  placeholder = "Start speaking to see your answer transcribe live in real time...",
  enableSilenceDetection = true,
  silenceTimeoutMs = 2500,
  autoStart = false,
  defaultLanguage = "en-US",
  className = "",
}: LiveVoiceTranscriberProps) {
  // Transcripts State: final confirmed text + interim active tokens
  const [finalTranscript, setFinalTranscript] = useState<string>(initialTranscript);
  const [interimTranscript, setInterimTranscript] = useState<string>("");

  // Recognition lifecycle states
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [selectedLang, setSelectedLang] = useState<string>(defaultLanguage);

  // Audio level & visualizer
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [isSpeakingActive, setIsSpeakingActive] = useState<boolean>(false);

  // Silence auto-commit states
  const [autoCommitEnabled, setAutoCommitEnabled] = useState<boolean>(
    enableSilenceDetection
  );
  const [silenceProgress, setSilenceProgress] = useState<number>(0); // 0 to 100%
  const [isCountingDown, setIsCountingDown] = useState<boolean>(false);

  // Copied indicator
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Refs for audio engine & recognition
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isListeningRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const selectedLangRef = useRef<string>(defaultLanguage);

  // AudioContext & AnalyserNode refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Silence timer refs
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownStartRef = useRef<number>(0);

  // Transcript scroll container ref
  const transcriptBoxRef = useRef<HTMLDivElement | null>(null);

  // Combined full transcript
  const fullTranscript = useMemo(() => {
    const combined = `${finalTranscript} ${interimTranscript}`.trim();
    return combined;
  }, [finalTranscript, interimTranscript]);

  // Sync refs with state
  useEffect(() => {
    isListeningRef.current = isListening;
    isPausedRef.current = isPaused;
    isMutedRef.current = isMuted;
    selectedLangRef.current = selectedLang;
  }, [isListening, isPaused, isMuted, selectedLang]);

  // Notify parent on transcript updates
  useEffect(() => {
    onTranscriptChange?.({
      final: finalTranscript,
      interim: interimTranscript,
      full: fullTranscript,
    });

    // Auto-scroll transcript container to bottom
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop =
        transcriptBoxRef.current.scrollHeight;
    }
  }, [finalTranscript, interimTranscript, fullTranscript, onTranscriptChange]);

  // ==========================================
  // 1. Web Audio API Analyser & Visualizer
  // ==========================================

  const startAudioVisualizer = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;

      // Close previous audio context if running
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        await audioContextRef.current.close().catch(() => {});
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        analyser.getByteFrequencyData(dataArray);

        // Calculate average audio level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalizedVolume = Math.min(Math.round((avg / 128) * 100), 100);
        setAudioVolume(normalizedVolume);
        setIsSpeakingActive(normalizedVolume > 12);

        // Canvas dimensions & High DPI support
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        const isAudioSuppressed = isMutedRef.current || isPausedRef.current || !isListeningRef.current;

        // Render dynamic frequency spectrum bars
        const barCount = 38;
        const barWidth = (width / barCount) * 0.65;
        const gap = (width - barCount * barWidth) / (barCount - 1);

        for (let i = 0; i < barCount; i++) {
          const index = Math.floor((i / barCount) * bufferLength);
          let barHeight = (dataArray[index] / 255) * height * 0.85;

          if (isAudioSuppressed) {
            barHeight = 4; // Idle resting state
          } else {
            barHeight = Math.max(barHeight, 4);
          }

          const x = i * (barWidth + gap);
          const y = (height - barHeight) / 2;

          // Gradient: Indigo #4F46E5 at base transitioning to Coral #F97316 at peaks
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          if (isAudioSuppressed) {
            gradient.addColorStop(0, "#CBD5E1"); // slate-300
            gradient.addColorStop(1, "#E2E8F0"); // slate-200
          } else {
            gradient.addColorStop(0, "#4F46E5"); // Indigo
            gradient.addColorStop(0.65, "#818CF8"); // Indigo light
            gradient.addColorStop(1, "#F97316"); // Coral accent
          }

          ctx.fillStyle = gradient;

          // Rounded bar rendering
          const radius = barWidth / 2;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, [radius]);
          ctx.fill();
        }

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
    } catch (err) {
      console.warn("[WebAudio] Failed to initialize AudioContext visualizer:", err);
    }
  }, []);

  const stopAudioVisualizer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setAudioVolume(0);
    setIsSpeakingActive(false);
  }, []);

  // ==========================================
  // 2. Silence Detection & Auto-Commit Engine
  // ==========================================

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsCountingDown(false);
    setSilenceProgress(0);
  }, []);

  const triggerAutoCommit = useCallback(() => {
    resetSilenceTimer();
    const candidateText = `${finalTranscript} ${interimTranscript}`.trim();
    if (candidateText.length > 0) {
      toast.success("Silence threshold reached — Answer committed automatically", {
        icon: "⚡",
      });
      onSendAnswer?.(candidateText);
      setFinalTranscript("");
      setInterimTranscript("");
    }
  }, [finalTranscript, interimTranscript, onSendAnswer, resetSilenceTimer]);

  const startSilenceTimer = useCallback(() => {
    if (!autoCommitEnabled) return;

    resetSilenceTimer();
    setIsCountingDown(true);
    countdownStartRef.current = Date.now();

    const intervalStepMs = 50;
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - countdownStartRef.current;
      const progress = Math.min((elapsed / silenceTimeoutMs) * 100, 100);
      setSilenceProgress(progress);
    }, intervalStepMs);

    silenceTimerRef.current = setTimeout(() => {
      triggerAutoCommit();
    }, silenceTimeoutMs);
  }, [
    autoCommitEnabled,
    silenceTimeoutMs,
    resetSilenceTimer,
    triggerAutoCommit,
  ]);

  // ==========================================
  // 3. Native Speech Recognition Setup
  // ==========================================

  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;

    const SpeechRec =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRec) {
      setIsSupported(false);
      return null;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLangRef.current || "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // If candidate speaks, instantly cancel silence countdown
        resetSilenceTimer();

        if (isMutedRef.current || isPausedRef.current) {
          return;
        }

        let accumulatedInterim = "";
        let newFinalSegments = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptText = result[0]?.transcript || "";

          if (result.isFinal) {
            newFinalSegments += `${transcriptText.trim()} `;
          } else {
            accumulatedInterim += transcriptText;
          }
        }

        if (newFinalSegments.trim()) {
          setFinalTranscript((prev) => {
            const next = prev ? `${prev} ${newFinalSegments.trim()}` : newFinalSegments.trim();
            return next;
          });
        }

        setInterimTranscript(accumulatedInterim.trim());

        // When a final clause completes and there's transcript, initiate silence timer
        if (newFinalSegments.trim() && !accumulatedInterim.trim()) {
          startSilenceTimer();
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "no-speech") {
          // Expected background pause in user voice — handled gracefully
          return;
        }
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          toast.error("Microphone permission denied. Please allow microphone access in your browser.");
          setIsListening(false);
          isListeningRef.current = false;
        } else if (event.error === "network") {
          toast.warning("Network interruption detected. Reconnecting speech engine...");
        } else {
          console.warn("[SpeechRecognition] Error event:", event.error);
        }
      };

      // Resilient Self-Healing Loop: Auto-restart if session ends unexpectedly
      recognition.onend = () => {
        if (isListeningRef.current && !isPausedRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already active or initializing
          }
        } else {
          setIsListening(false);
        }
      };

      return recognition;
    } catch (err) {
      console.error("[SpeechRecognition] Initialization failed:", err);
      setIsSupported(false);
      return null;
    }
  }, [resetSilenceTimer, startSilenceTimer]);

  // ==========================================
  // 4. Lifecycle Controls
  // ==========================================

  const startListening = useCallback(async () => {
    if (!isSupported) {
      toast.error("Speech Recognition is not supported in this browser. Please use Google Chrome or MS Edge.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const rec = initRecognition();
    if (!rec) return;

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
      setIsPaused(false);
      isPausedRef.current = false;
      await startAudioVisualizer();
      toast.info("Microphone connected. Real-time transcription active.", {
        icon: "🎙️",
      });
    } catch (err) {
      console.warn("[Speech] Could not start recognition:", err);
    }
  }, [initRecognition, isSupported, startAudioVisualizer]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setIsPaused(false);
    resetSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    stopAudioVisualizer();
  }, [resetSilenceTimer, stopAudioVisualizer]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = true));
      }
      toast.info("Speech recognition resumed");
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      resetSilenceTimer();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = false));
      }
      toast.info("Speech recognition paused");
    }
  }, [isPaused, resetSilenceTimer]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    if (nextMuted) {
      resetSilenceTimer();
      toast.info("Microphone input muted");
    } else {
      toast.info("Microphone unmuted");
    }
  }, [isMuted, resetSilenceTimer]);

  const handleClearTranscript = useCallback(() => {
    resetSilenceTimer();
    setFinalTranscript("");
    setInterimTranscript("");
    toast.info("Transcript cleared");
  }, [resetSilenceTimer]);

  const handleSendAnswer = useCallback(() => {
    resetSilenceTimer();
    const candidateText = fullTranscript.trim();
    if (!candidateText) {
      toast.warning("No spoken answer recorded yet. Speak into your microphone first.");
      return;
    }

    onSendAnswer?.(candidateText);
    setFinalTranscript("");
    setInterimTranscript("");
    toast.success("Answer successfully submitted!");
  }, [fullTranscript, onSendAnswer, resetSilenceTimer]);

  const handleLanguageChange = useCallback(
    (newLang: string) => {
      setSelectedLang(newLang);
      selectedLangRef.current = newLang;
      if (isListening) {
        // Restart recognition with newly selected language
        stopListening();
        setTimeout(() => {
          startListening();
        }, 150);
      }
    },
    [isListening, startListening, stopListening]
  );

  const handleCopyTranscript = useCallback(() => {
    if (!fullTranscript) return;
    navigator.clipboard.writeText(fullTranscript);
    setHasCopied(true);
    toast.success("Transcript copied to clipboard");
    setTimeout(() => setHasCopied(false), 2000);
  }, [fullTranscript]);

  // Mount effect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRec =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        setIsSupported(false);
      } else if (autoStart) {
        startListening();
      }
    }

    return () => {
      stopListening();
    };
  }, [autoStart, startListening, stopListening]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to submit answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSendAnswer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSendAnswer]);

  return (
    <div
      className={`w-full max-w-4xl mx-auto bg-[#F8FAFC] p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm transition-all ${className}`}
    >
      {/* ==========================================
          Header Section: Status Badges & Language
      ========================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isListening && !isPaused && !isMuted ? (
              <>
                <span className="absolute inline-flex h-4 w-4 animate-ping rounded-full bg-[#F97316] opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-[#F97316]" />
              </>
            ) : isPaused ? (
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
            ) : (
              <span className="relative inline-flex h-3 w-3 rounded-full bg-slate-400" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                Live Voice Transcriber
              </h3>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                  isListening && !isPaused && !isMuted
                    ? "border-[#F97316]/40 text-[#F97316] bg-[#F97316]/10"
                    : isPaused
                    ? "border-amber-500/40 text-amber-600 bg-amber-50"
                    : "border-slate-300 text-slate-600 bg-slate-100"
                }`}
              >
                {isListening && !isPaused && !isMuted
                  ? "Listening Live"
                  : isPaused
                  ? "Paused"
                  : isMuted
                  ? "Muted"
                  : "Standby"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time streaming speech-to-text with auto-commit silence detection
            </p>
          </div>
        </div>

        {/* Language selector & auto-commit toggle */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
            <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="h-7 border-0 bg-transparent text-xs text-slate-700 font-medium px-1 focus:ring-0 focus:outline-hidden cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setAutoCommitEnabled(!autoCommitEnabled)}
            className={`h-8 px-2.5 text-xs font-medium rounded-lg border flex items-center transition-colors cursor-pointer ${
              autoCommitEnabled
                ? "bg-indigo-50 border-indigo-200 text-[#4F46E5]"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
            title="Auto-send after 2.5s silence"
          >
            <Clock className="h-3.5 w-3.5 mr-1" />
            Auto-commit: {autoCommitEnabled ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* ==========================================
          Audio Waveform Visualizer Canvas
      ========================================== */}
      <div className="my-4 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 px-2">
          <div className="flex items-center gap-2">
            <Radio
              className={`h-3.5 w-3.5 ${
                isSpeakingActive ? "text-[#F97316] animate-pulse" : "text-slate-400"
              }`}
            />
            <span className="font-mono text-[11px] font-medium text-slate-600">
              AUDIO INPUT WAVEFORM
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              Level: {audioVolume}%
            </span>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4F46E5] to-[#F97316] transition-all duration-75"
                style={{ width: `${audioVolume}%` }}
              />
            </div>
          </div>
        </div>

        <div className="h-16 w-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={64}
            className="w-full h-full block"
          />
        </div>

        {/* Silence Countdown Visual Bar */}
        {isCountingDown && autoCommitEnabled && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-1.5 text-amber-600 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>Silence detected — auto-committing in {(silenceTimeoutMs / 1000).toFixed(1)}s...</span>
            </div>
            <div className="w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-[#F97316] transition-all duration-75"
                style={{ width: `${silenceProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          Live Transcript Display Box
          - Confirmed in text-slate-900
          - Interim in text-slate-400 italic
      ========================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs relative">
        <div className="flex items-center justify-between text-xs text-slate-500 pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Live Transcript:</span>
            <span className="text-[11px] text-slate-400">
              {finalTranscript
                ? `${finalTranscript.trim().split(/\s+/).length} words`
                : "Awaiting speech"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {fullTranscript && (
              <button
                type="button"
                onClick={handleCopyTranscript}
                className="h-6 px-2 text-[11px] text-slate-500 hover:text-slate-800 flex items-center rounded-sm hover:bg-slate-100 cursor-pointer transition-colors"
              >
                {hasCopied ? (
                  <>
                    <Check className="h-3 w-3 mr-1 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            )}

            {fullTranscript && (
              <button
                type="button"
                onClick={handleClearTranscript}
                className="h-6 px-2 text-[11px] text-slate-400 hover:text-rose-600 flex items-center rounded-sm hover:bg-rose-50 cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Transcript Text View */}
        <div
          ref={transcriptBoxRef}
          className="min-h-[140px] max-h-[260px] overflow-y-auto text-sm sm:text-base leading-relaxed pr-1 select-text scroll-smooth"
        >
          {fullTranscript ? (
            <p className="whitespace-pre-wrap break-words">
              {/* Confirmed sentences in bold dark slate */}
              <span className="text-slate-900 font-normal">
                {finalTranscript}
              </span>

              {/* Incomplete / In-flight spoken words in soft gray italic with blinking pulse */}
              {interimTranscript && (
                <span className="text-slate-400 italic ml-1 inline-flex items-center">
                  {interimTranscript}
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[#F97316] rounded-full animate-pulse" />
                </span>
              )}
            </p>
          ) : (
            <div className="h-[140px] flex flex-col items-center justify-center text-center text-slate-400 gap-2">
              <Mic className="h-7 w-7 text-slate-300 stroke-1" />
              <p className="text-xs sm:text-sm max-w-sm">{placeholder}</p>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          Controls Bar
      ========================================== */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {/* Main Record / Stop Button */}
          {!isListening ? (
            <button
              type="button"
              onClick={startListening}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs font-medium inline-flex items-center gap-2 px-5 h-10 rounded-xl transition-all cursor-pointer text-sm"
            >
              <Mic className="h-4 w-4" />
              Start Speaking
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="border border-rose-200 text-rose-600 hover:bg-rose-50 h-10 px-4 rounded-xl font-medium inline-flex items-center gap-2 cursor-pointer text-sm"
            >
              <MicOff className="h-4 w-4" />
              Stop Mic
            </button>
          )}

          {/* Pause / Resume Button */}
          {isListening && (
            <button
              type="button"
              onClick={togglePause}
              className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-10 px-3.5 rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-2xs cursor-pointer font-medium"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 text-emerald-600 fill-emerald-600" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 text-amber-600 fill-amber-600" />
                  Pause
                </>
              )}
            </button>
          )}

          {/* Mute / Unmute Button */}
          {isListening && (
            <button
              type="button"
              onClick={toggleMute}
              className={`h-10 px-3.5 rounded-xl text-xs sm:text-sm inline-flex items-center gap-1.5 border shadow-2xs font-medium cursor-pointer ${
                isMuted
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4 text-amber-600" />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-slate-500" />
                  Mute
                </>
              )}
            </button>
          )}
        </div>

        {/* Primary Action: Send Answer / Done Speaking */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSendAnswer}
            disabled={!fullTranscript.trim()}
            className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium h-10 px-5 rounded-xl shadow-xs inline-flex items-center gap-2 transition-all cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            <span>Send Answer / Done Speaking</span>
            <span className="hidden sm:inline-block ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
              Ctrl+↵
            </span>
          </button>
        </div>
      </div>

      {/* Browser Speech Compatibility Notice */}
      {!isSupported && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p>
            Your browser does not have the native Web Speech API enabled. We recommend using <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for the full real-time speech-to-text experience.
          </p>
        </div>
      )}
    </div>
  );
}
