"use client";

import React, { useEffect, useRef } from "react";

export default function AudioVisualizer({
  status = "idle", // "idle" | "listening" | "thinking" | "speaking"
  candidateActive = false,
  aiActive = false,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let step = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      step += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine active frequencies & amplitude based on states
      const isSpeaking = status === "speaking" || aiActive;
      const isListening = status === "listening" || candidateActive;
      const isThinking = status === "thinking";

      const baseAmp = isSpeaking
        ? height * 0.35
        : isListening
        ? height * 0.28
        : isThinking
        ? height * 0.12
        : height * 0.04;

      // Draw background ambient glow
      const glowGrad = ctx.createRadialGradient(
        width / 2,
        centerY,
        10,
        width / 2,
        centerY,
        width / 2
      );
      if (isSpeaking) {
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else if (isListening) {
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else {
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.03)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // Multi-layer waveform synthesis
      const waveLayers = [
        {
          color: isSpeaking
            ? "rgba(255, 255, 255, 0.95)"
            : isListening
            ? "rgba(255, 255, 255, 0.75)"
            : isThinking
            ? "rgba(200, 200, 200, 0.5)"
            : "rgba(120, 120, 120, 0.3)",
          speed: 1.0,
          frequency: 0.02,
          ampMult: 1.0,
          lineWidth: 2.5,
        },
        {
          color: isSpeaking
            ? "rgba(220, 220, 220, 0.7)"
            : isListening
            ? "rgba(180, 180, 180, 0.6)"
            : isThinking
            ? "rgba(160, 160, 160, 0.4)"
            : "rgba(90, 90, 90, 0.25)",
          speed: 1.4,
          frequency: 0.035,
          ampMult: 0.7,
          lineWidth: 2,
        },
        {
          color: isSpeaking
            ? "rgba(180, 180, 180, 0.5)"
            : isListening
            ? "rgba(140, 140, 140, 0.4)"
            : isThinking
            ? "rgba(120, 120, 120, 0.3)"
            : "rgba(70, 70, 70, 0.15)",
          speed: 0.7,
          frequency: 0.015,
          ampMult: 0.5,
          lineWidth: 1.5,
        },
      ];

      waveLayers.forEach((layer) => {
        ctx.beginPath();
        ctx.lineWidth = layer.lineWidth * (window.devicePixelRatio || 1);
        ctx.strokeStyle = layer.color;
        ctx.lineCap = "round";

        for (let x = 0; x < width; x += 3) {
          // Windowing envelope function: taper wave at left and right edges
          const normX = x / width;
          const envelope = Math.sin(normX * Math.PI);

          const y =
            centerY +
            Math.sin(x * layer.frequency + step * layer.speed) *
              Math.cos(x * 0.01 - step * 0.5) *
              baseAmp *
              layer.ampMult *
              envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      // Central audio pulse dot
      ctx.beginPath();
      const dotRadius =
        (isSpeaking || isListening ? 6 + Math.sin(step * 4) * 2 : 4) *
        (window.devicePixelRatio || 1);
      ctx.arc(width / 2, centerY, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking || isListening ? "rgba(255, 255, 255, 0.9)" : "rgba(180, 180, 180, 0.7)";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
      ctx.fill();
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [status, candidateActive, aiActive]);

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-card border border-border ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ minHeight: "140px" }}
      />
    </div>
  );
}
