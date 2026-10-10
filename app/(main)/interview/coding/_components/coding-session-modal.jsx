"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Sparkles,
  Loader2,
  Cpu,
  Layers,
  Gauge,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { generateCodingSession } from "@/actions/coding";

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript (Node.js)" },
  { id: "typescript", label: "TypeScript (ES2023)" },
  { id: "python", label: "Python (v3.12)" },
  { id: "java", label: "Java (OpenJDK 21)" },
  { id: "cpp", label: "C++ (C++20 / GCC 14)" },
  { id: "go", label: "Go (Golang 1.22)" },
];

const QUESTION_COUNTS = [
  { count: 1, label: "1 Problem", desc: "Quick 20-min focused screen" },
  { count: 3, label: "3 Problems", desc: "Standard 45-min technical interview" },
  { count: 5, label: "5 Problems", desc: "Comprehensive 90-min FAANG bar-raiser" },
];

const DIFFICULTIES = [
  { id: "Adaptive", label: "Adaptive (Recommended)", desc: "Curves to your experience profile" },
  { id: "Easy", label: "Easy", desc: "Fundamental array and string invariants" },
  { id: "Medium", label: "Medium", desc: "Standard LeetCode medium algorithms" },
  { id: "Hard", label: "Hard", desc: "Advanced dynamic programming & graphs" },
];

const TOPICS = [
  "All Topics",
  "Arrays & Hashing",
  "Two Pointers & Sliding Window",
  "Trees & Binary Search Trees",
  "Dynamic Programming",
  "Strings & Parsing",
  "Stack & Queues",
  "Graphs & BFS/DFS",
];

export default function CodingSessionModal({
  isOpen,
  onClose,
  onSessionStarted,
}) {
  const [language, setLanguage] = useState("javascript");
  const [questionCount, setQuestionCount] = useState(3);
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [topic, setTopic] = useState("All Topics");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(1);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStep(1);

    // Simulate animated generation milestones for premium feel
    const stepTimer1 = setTimeout(() => setGenerationStep(2), 1200);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 2800);

    try {
      const response = await generateCodingSession({
        language,
        questionCount,
        difficulty,
        topic,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (response?.success && response?.problems?.length > 0) {
        toast.success(`Generated ${response.problems.length} coding challenge${response.problems.length > 1 ? "s" : ""}!`);
        onSessionStarted(response);
        onClose();
      } else {
        throw new Error("Unable to construct test suite");
      }
    } catch (err) {
      console.error("Error generating coding session:", err);
      toast.error("Failed to generate coding session. Please try again.");
    } finally {
      setIsGenerating(false);
      setGenerationStep(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isGenerating && !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold gradient-title">
              Configure Coding Assessment
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure your programming language, question suite volume, and algorithmic focus.
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          /* Animated Generation Skeleton */
          <div className="py-10 space-y-6 text-center">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Code2 className="h-7 w-7 text-primary animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-base">
                {generationStep === 1 && "Synthesizing Algorithmic Specifications..."}
                {generationStep === 2 && "Curating Test Cases & Big-O Invariants..."}
                {generationStep === 3 && "Configuring Monaco Sandbox Environment..."}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Gemini is generating custom function signatures, runtime constraints, and hidden edge cases for {language.toUpperCase()}.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Badge variant="outline" className="text-[11px] font-mono animate-pulse">
                {language}
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono animate-pulse">
                {questionCount} Problem{questionCount > 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="text-[11px] font-mono animate-pulse">
                {difficulty}
              </Badge>
            </div>
          </div>
        ) : (
          /* Session Setup Form */
          <div className="space-y-5 py-2">
            {/* Language Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                Target Programming Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Count Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Layers className="h-3.5 w-3.5 text-primary" />
                Assessment Volume
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {QUESTION_COUNTS.map((qc) => {
                  const isSelected = questionCount === qc.count;
                  return (
                    <div
                      key={qc.count}
                      onClick={() => setQuestionCount(qc.count)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border hover:border-border/80 bg-background/50 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">
                          {qc.label}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                        {qc.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Curve */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                Target Difficulty Curve
              </Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((diff) => (
                    <SelectItem key={diff.id} value={diff.id}>
                      {diff.label} - {diff.desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Focus */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Primary Algorithmic Topic
              </Label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select topic focus" />
                </SelectTrigger>
                <SelectContent>
                  {TOPICS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter className="pt-2">
          {!isGenerating && (
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="ghost" onClick={onClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Assessment Suite
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
