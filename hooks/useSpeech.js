"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const STORAGE_KEY = "quiz_tts_autoplay";

export default function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabledState] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const voicesRef = useRef([]);
  const activeUtteranceRef = useRef(null);

  // Check support and load preferences from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);

      const savedAutoPlay = localStorage.getItem(STORAGE_KEY);
      if (savedAutoPlay !== null) {
        setIsAutoPlayEnabledState(savedAutoPlay === "true");
      }

      const updateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update autoplay toggle & persist to localStorage
  const setIsAutoPlayEnabled = useCallback((value) => {
    setIsAutoPlayEnabledState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, String(value));
    }
  }, []);

  // Pick the most natural English voice available
  const getPreferredVoice = useCallback(() => {
    if (!voicesRef.current || voicesRef.current.length === 0) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        voicesRef.current = window.speechSynthesis.getVoices();
      }
    }

    const voices = voicesRef.current;
    if (!voices || voices.length === 0) return null;

    // Preference hierarchy: Natural -> Google US -> English US -> Any English
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Natural") ||
          v.name.includes("Google US English") ||
          v.name.includes("Samantha") ||
          v.name.includes("Ava"))
    );
    if (naturalVoice) return naturalVoice;

    const usVoice = voices.find((v) => v.lang === "en-US");
    if (usVoice) return usVoice;

    const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
    if (anyEnglish) return anyEnglish;

    return voices[0] || null;
  }, []);

  // Stop currently playing speech
  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
    setIsSpeaking(false);
  }, []);

  // Speak raw text
  const speak = useCallback(
    (text, onComplete) => {
      if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }

      // Cancel previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      activeUtteranceRef.current = utterance;

      const voice = getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.95; // Natural clear cadence
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        // "interrupted" or "canceled" are expected when user stops or changes slide
        if (e.error !== "interrupted" && e.error !== "canceled") {
          console.warn("Speech synthesis error:", e);
        }
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Could not start speech synthesis:", err);
        setIsSpeaking(false);
      }
    },
    [getPreferredVoice]
  );

  // Format question & options with natural pauses
  const speakQuestion = useCallback(
    (questionNumber, questionObj, onComplete) => {
      if (!questionObj) return;

      const optionLabels = ["A", "B", "C", "D", "E", "F"];
      const formattedOptions = (questionObj.options || [])
        .map((opt, i) => `Option ${optionLabels[i] || i + 1}: ${opt}.`)
        .join(" ... ");

      // Natural pause between question and options using ellipsis and punctuation
      const textToSpeak = `Question ${questionNumber}. ${questionObj.question}. ... Here are your options: ... ${formattedOptions}`;

      speak(textToSpeak, onComplete);
    },
    [speak]
  );

  return {
    isSpeaking,
    isAutoPlayEnabled,
    setIsAutoPlayEnabled,
    isSupported,
    speak,
    speakQuestion,
    stop,
  };
}
