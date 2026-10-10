"use client";

import React, { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Code2,
  Sparkles,
  AlertTriangle,
  Zap,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CodingResultsView({
  evaluationData,
  onReturnToDashboard,
}) {
  const {
    overallScore = 80,
    passRateText = "Assessment Complete",
    allPassed = true,
    summaryVerdict = "Strong problem-solving methodology with verified invariants.",
    strengths = [],
    weaknesses = [],
    recommendations = [],
    problemEvaluations = [],
  } = evaluationData || {};

  // Track expanded optimal solutions: { [problemId]: boolean }
  const [expandedSolutions, setExpandedSolutions] = useState({});

  const toggleSolution = (id) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Banner / Verdict Hero */}
      <Card className="border-border/80 bg-card/80 backdrop-blur-md shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs uppercase font-mono">
                  Assessment Report
                </Badge>
                <Badge
                  variant={allPassed ? "default" : "secondary"}
                  className="text-xs font-semibold"
                >
                  {passRateText}
                </Badge>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold gradient-title">
                {allPassed ? "Excellent Engineering Execution" : "Assessment Completed with Optimization Notes"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                {summaryVerdict}
              </p>
            </div>

            {/* Score Ring / Badge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-muted/40 border border-border shrink-0 text-center min-w-[140px]">
              <Trophy className="h-7 w-7 text-primary mb-1" />
              <div className="text-3xl md:text-4xl font-extrabold text-foreground">
                {Math.round(overallScore)}%
              </div>
              <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">
                Composite Score
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Core Algorithmic Strengths
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-foreground/90">
            {strengths.length > 0 ? (
              <ul className="space-y-1.5 list-disc list-inside">
                {strengths.map((str, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {str}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Sound algorithm structure and test coverage.</p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses / Opportunities */}
        <Card className="border-amber-500/20 bg-amber-500/5 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Optimization Opportunities & Gaps
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-foreground/90">
            {weaknesses.length > 0 ? (
              <ul className="space-y-1.5 list-disc list-inside">
                {weaknesses.map((w, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {w}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Minor boundary checks and idiomatic refinement.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              Actionable Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1.5 text-foreground/90">
            <ul className="space-y-1.5 list-disc list-inside">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="leading-relaxed">
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Problem-by-Problem Evaluation Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold gradient-title flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          Problem-by-Problem Diagnostic Review
        </h3>

        <div className="space-y-4">
          {problemEvaluations.map((pe, idx) => {
            const isAccepted = pe.status === "ACCEPTED" || (pe.score || 0) >= 70;
            const isExpanded = !!expandedSolutions[pe.problemId || idx];

            return (
              <Card
                key={pe.problemId || idx}
                className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm"
              >
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Challenge {idx + 1}
                        </span>
                        {isAccepted ? (
                          <Badge variant="outline" className="border-emerald-500 text-emerald-500 text-[10px]">
                            ACCEPTED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-500 text-[10px]">
                            FAILED
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground">
                        {pe.problemTitle || `Challenge ${idx + 1}`}
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xl font-bold text-foreground">
                          {Math.round(pe.score || 0)}%
                        </span>
                        <span className="block text-[10px] text-muted-foreground uppercase">
                          Score
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4 text-xs">
                  {/* Big-O Complexity & Quality Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border font-mono text-[11px]">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                        Time Complexity
                      </span>
                      <span className="font-bold text-foreground">
                        {pe.timeComplexity || "O(n)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                        Space Complexity
                      </span>
                      <span className="font-bold text-foreground">
                        {pe.spaceComplexity || "O(1)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                        Clean Code
                      </span>
                      <span className="font-bold text-foreground">
                        {pe.cleanCodeScore || 8} / 10
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-sans">
                        Idiomatic
                      </span>
                      <span className="font-bold text-foreground">
                        {pe.idiomaticScore || 8} / 10
                      </span>
                    </div>
                  </div>

                  {/* Feedback Critique */}
                  {pe.feedback && (
                    <div className="p-3 rounded-xl border border-border/80 bg-background/50 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Architectural Critique
                      </span>
                      <p className="text-xs text-foreground/90 leading-relaxed font-sans">
                        {pe.feedback}
                      </p>
                    </div>
                  )}

                  {/* Anti-Patterns */}
                  {pe.antiPatterns?.length > 0 && (
                    <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Anti-Patterns Detected
                      </span>
                      <ul className="text-xs space-y-0.5 text-foreground/80 list-disc list-inside">
                        {pe.antiPatterns.map((ap, i) => (
                          <li key={i}>{ap}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Optimal Solution Reveal Accordion */}
                  {pe.optimalSolution && (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSolution(pe.problemId || idx)}
                        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                      >
                        <span className="font-semibold text-xs text-primary flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5" />
                          Optimal Reference Solution
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <pre className="p-3.5 bg-muted/80 overflow-x-auto text-xs font-mono border-t border-border leading-relaxed text-foreground/90 max-h-72">
                          {pe.optimalSolution}
                        </pre>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Return to Dashboard CTA */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={onReturnToDashboard}
          className="gap-2 font-semibold shadow-md"
        >
          Return to Coding Hub Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
