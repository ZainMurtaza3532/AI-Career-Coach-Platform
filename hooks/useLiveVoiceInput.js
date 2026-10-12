"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Production-Grade Real-Time Live Dictation Hook
 * Combines native Web Speech API (continuous + interim streaming) with
 * Web Audio API (AnalyserNode + volume monitoring) and smart silence detection.
 */
export default function useLiveVoiceInput({
  lang = "en-US",
  silenceTimeoutMs = 2500,
  autoSilenceCommit = false,
  onAutoPause,
  onTranscriptChange,
} = {}) {
  // Transcripts
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [fullTranscript, setFullTranscript] = useState("");

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [silenceProgress, setSilenceProgress] = useState(0);
  const [isSilenceCountdown, setIsSilenceCountdown] = useState(false);

  // Engine refs
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isPausedRef = useRef(false);
  const isMutedRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const interimTranscriptRef = useRef("");

  // Web Audio refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Silence timer refs
  const silenceTimerRef = useRef(null);
  const silenceIntervalRef = useRef(null);
  const countdownStartRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    isRecordingRef.current = isRecording;
    isPausedRef.current = isPaused;
    isMutedRef.current = isMuted;
    finalTranscriptRef.current = finalTranscript;
    interimTranscriptRef.current = interimTranscript;
  }, [isRecording, isPaused, isMuted, finalTranscript, interimTranscript]);

  // Combine full transcript
  useEffect(() => {
    const combined = `${finalTranscript} ${interimTranscript}`.trim();
    setFullTranscript(combined);
    onTranscriptChange?.({
      final: finalTranscript,
      interim: interimTranscript,
      full: combined,
    });
  }, [finalTranscript, interimTranscript, onTranscriptChange]);

  // ==========================================
  // Silence Detection Helpers
  // ==========================================
  const cancelSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    setIsSilenceCountdown(false);
    setSilenceProgress(0);
  }, []);

  const startSilenceTimer = useCallback(() => {
    cancelSilenceTimer();
    setIsSilenceCountdown(true);
    countdownStartRef.current = Date.now();

    const stepMs = 50;
    silenceIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - countdownStartRef.current;
      const pct = Math.min((elapsed / silenceTimeoutMs) * 100, 100);
      setSilenceProgress(pct);
    }, stepMs);

    silenceTimerRef.current = setTimeout(() => {
      cancelSilenceTimer();
      const currentFull = `${finalTranscriptRef.current} ${interimTranscriptRef.current}`.trim();
      if (currentFull) {
        onAutoPause?.(currentFull);
      }
    }, silenceTimeoutMs);
  }, [cancelSilenceTimer, onAutoPause, silenceTimeoutMs]);

  // ==========================================
  // Web Audio Visualizer & Level Monitor
  // ==========================================
  const startAudioEngine = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;

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

      const AudioCtx =
        window.AudioContext || window.webkitAudioContext;
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

      const monitorAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(Math.round((avg / 128) * 100), 100);

        if (isMutedRef.current || isPausedRef.current) {
          setAudioLevel(0);
          setIsSpeaking(false);
        } else {
          setAudioLevel(normalized);
          setIsSpeaking(normalized > 12);
        }

        animationFrameRef.current = requestAnimationFrame(monitorAudio);
      };

      monitorAudio();
    } catch (err) {
      console.warn("[useLiveVoiceInput] Audio visualizer initialization notice:", err);
    }
  }, []);

  const stopAudioEngine = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    setIsSpeaking(false);
  }, []);

  // ==========================================
  // Web Speech Recognition Engine
  // ==========================================
  const initSpeechRecognition = useCallback(() => {
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
      recognition.lang = lang || "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
      };

      recognition.onresult = (event) => {
        // Any incoming speech resets the silence timer
        cancelSilenceTimer();

        if (isMutedRef.current || isPausedRef.current) return;

        let accumulatedInterim = "";
        let newFinalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || "";
          if (res.isFinal) {
            newFinalText += `${text.trim()} `;
          } else {
            accumulatedInterim += text;
          }
        }

        if (newFinalText.trim()) {
          setFinalTranscript((prev) => {
            const next = prev ? `${prev} ${newFinalText.trim()}` : newFinalText.trim();
            return next;
          });
        }

        setInterimTranscript(accumulatedInterim.trim());

        // When a final segment settles, start silence countdown
        if (newFinalText.trim() && !accumulatedInterim.trim()) {
          startSilenceTimer();
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          // Expected pause
          return;
        }
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          console.warn("[Speech] Microphone access blocked.");
          setIsRecording(false);
          isRecordingRef.current = false;
        } else if (event.error === "network") {
          console.warn("[Speech] Network latency detected. Auto-reconnecting...");
        } else {
          console.warn("[Speech] Error event:", event.error);
        }
      };

      // Self-healing reconnection loop
      recognition.onend = () => {
        if (isRecordingRef.current && !isPausedRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already starting
          }
        } else {
          setIsRecording(false);
        }
      };

      return recognition;
    } catch (err) {
      console.error("[useLiveVoiceInput] Speech recognition error:", err);
      setIsSupported(false);
      return null;
    }
  }, [cancelSilenceTimer, lang, startSilenceTimer]);

  // ==========================================
  // Public Controls
  // ==========================================
  const startListening = useCallback(async () => {
    if (!isSupported) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    const rec = initSpeechRecognition();
    if (!rec) return;

    recognitionRef.current = rec;
    try {
      rec.start();
      setIsRecording(true);
      setIsPaused(false);
      isPausedRef.current = false;
      await startAudioEngine();
    } catch (err) {
      console.warn("[useLiveVoiceInput] Start error:", err);
    }
  }, [initSpeechRecognition, isSupported, startAudioEngine]);

  const stopListening = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsPaused(false);
    cancelSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    stopAudioEngine();
  }, [cancelSilenceTimer, stopAudioEngine]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      isPausedRef.current = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = true));
      }
    } else {
      setIsPaused(true);
      isPausedRef.current = true;
      cancelSilenceTimer();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((t) => (t.enabled = false));
      }
    }
  }, [cancelSilenceTimer, isPaused]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !nextMuted;
      });
    }

    if (nextMuted) {
      cancelSilenceTimer();
    }
  }, [cancelSilenceTimer, isMuted]);

  const resetTranscript = useCallback(() => {
    cancelSilenceTimer();
    setFinalTranscript("");
    setInterimTranscript("");
    setFullTranscript("");
  }, [cancelSilenceTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
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
    analyserNode: analyserRef.current,
    startListening,
    stopListening,
    togglePause,
    toggleMute,
    resetTranscript,
  };
}
