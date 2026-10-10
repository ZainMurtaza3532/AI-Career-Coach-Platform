"use client";

import React from "react";
import { Trophy, Code2, Cpu, Zap, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CodingStatsCards({ assessments = [] }) {
  // 1. Average Score
  const getAverageScore = () => {
    if (!assessments.length) return "0.0";
    const total = assessments.reduce((sum, a) => sum + (a.score || 0), 0);
    return (total / assessments.length).toFixed(1);
  };

  // 2. Total Challenges Completed
  const totalCompleted = assessments.length;

  // 3. Most Practiced Language
  const getMostPracticedLanguage = () => {
    if (!assessments.length) return "None yet";
    const counts = {};
    for (const a of assessments) {
      const lang = a.language ? a.language.toLowerCase() : "javascript";
      counts[lang] = (counts[lang] || 0) + 1;
    }
    let topLang = "javascript";
    let maxCount = 0;
    for (const [lang, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        topLang = lang;
      }
    }
    const displayMap = {
      javascript: "JavaScript",
      typescript: "TypeScript",
      python: "Python",
      java: "Java",
      cpp: "C++",
      go: "Go",
    };
    const percentage = Math.round((maxCount / assessments.length) * 100);
    return `${displayMap[topLang] || topLang} (${percentage}%)`;
  };

  // 4. Complexity Optimization Rating
  const getOptimizationRating = () => {
    if (!assessments.length) return "100%";
    const optimalCount = assessments.filter(
      (a) => a.status === "ACCEPTED" || (a.score || 0) >= 80
    ).length;
    return `${Math.round((optimalCount / assessments.length) * 100)}%`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {getAverageScore()}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across {totalCompleted} coding challenge{totalCompleted === 1 ? "" : "s"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Challenges Completed
          </CardTitle>
          <Code2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {totalCompleted}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total submitted solutions
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Language
          </CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight truncate">
            {getMostPracticedLanguage()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Most frequent environment
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Complexity Efficiency
          </CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {getOptimizationRating()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Big-O time & space optimal
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
