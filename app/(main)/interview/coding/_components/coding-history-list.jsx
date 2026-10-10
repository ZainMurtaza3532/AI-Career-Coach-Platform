"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Code2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Zap,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

export default function CodingHistoryList({ assessments = [], onStartNew }) {
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  return (
    <>
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="gradient-title text-2xl md:text-3xl flex items-center gap-2">
              <Code2 className="h-6 w-6 text-primary" />
              Historical Coding Sessions
            </CardTitle>
            <CardDescription>
              Review code submissions, Big-O audits, and architectural critiques
            </CardDescription>
          </div>
          <Button onClick={onStartNew} className="gap-2 shrink-0">
            <Sparkles className="h-4 w-4" />
            Start New Coding Session
          </Button>
        </CardHeader>
        <CardContent>
          {!assessments.length ? (
            <div className="py-12 text-center border border-dashed rounded-xl border-border/80">
              <p className="text-sm font-medium text-foreground">
                No past coding sessions recorded yet
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Ready to test your algorithms? Launch a session to begin live interactive coding screens.
              </p>
              <Button onClick={onStartNew} variant="outline" className="mt-4 gap-2">
                <Code2 className="h-4 w-4" />
                Launch First Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => {
                const isAccepted = a.status === "ACCEPTED" || (a.score || 0) >= 70;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAssessment(a)}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-border/70 hover:border-primary/50 bg-background/50 hover:bg-muted/40 transition-all cursor-pointer gap-3"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                          {a.problemTitle || "Coding Challenge"}
                        </span>
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {a.language || "javascript"}
                        </Badge>
                        {a.difficulty && (
                          <Badge variant="secondary" className="text-[10px]">
                            {a.difficulty}
                          </Badge>
                        )}
                        {a.topic && (
                          <span className="text-[11px] text-muted-foreground hidden sm:inline">
                            • {a.topic}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(a.createdAt), "MMM dd, yyyy HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Time: {a.timeComplexity || "O(n)"} | Space: {a.spaceComplexity || "O(1)"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-center gap-1.5">
                          {isAccepted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                          )}
                          <span className="font-bold text-sm text-foreground">
                            {Math.round(a.score || 0)}%
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">
                          {a.status || (isAccepted ? "ACCEPTED" : "FAILED")}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Review
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog
        open={!!selectedAssessment}
        onOpenChange={(open) => !open && setSelectedAssessment(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedAssessment && (
            <div className="space-y-5">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[11px] font-mono uppercase">
                    {selectedAssessment.language}
                  </Badge>
                  {selectedAssessment.difficulty && (
                    <Badge variant="secondary" className="text-[11px]">
                      {selectedAssessment.difficulty}
                    </Badge>
                  )}
                  {selectedAssessment.topic && (
                    <Badge variant="outline" className="text-[11px]">
                      {selectedAssessment.topic}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl font-bold gradient-title">
                  {selectedAssessment.problemTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Submitted on {format(new Date(selectedAssessment.createdAt), "MMMM dd, yyyy 'at' HH:mm")}
                </DialogDescription>
              </DialogHeader>

              {/* Score & Complexity Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-muted/40 rounded-xl border border-border text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Score</span>
                  <span className="font-bold text-base text-foreground">
                    {Math.round(selectedAssessment.score || 0)}%
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Time Complexity</span>
                  <span className="font-semibold text-foreground font-mono">
                    {selectedAssessment.timeComplexity || "O(n)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Space Complexity</span>
                  <span className="font-semibold text-foreground font-mono">
                    {selectedAssessment.spaceComplexity || "O(1)"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Clean Code</span>
                  <span className="font-semibold text-foreground">
                    {selectedAssessment.cleanCodeScore || 8} / 10
                  </span>
                </div>
              </div>

              {/* Feedback Critique */}
              {selectedAssessment.feedback && (
                <div className="p-3.5 rounded-xl border border-border bg-card/60 space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Architectural Feedback
                  </h4>
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {selectedAssessment.feedback}
                  </p>
                </div>
              )}

              {/* Anti-Patterns */}
              {selectedAssessment.antiPatterns?.length > 0 && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Areas for Optimization
                  </h4>
                  <ul className="text-xs space-y-1 text-foreground/80 list-disc list-inside">
                    {selectedAssessment.antiPatterns.map((pat, idx) => (
                      <li key={idx}>{pat}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submitted Code */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Candidate Submission ({selectedAssessment.language})
                </h4>
                <pre className="p-3.5 rounded-xl bg-muted/70 border border-border overflow-x-auto text-xs font-mono max-h-60 leading-relaxed text-foreground">
                  {selectedAssessment.code || "// No code saved"}
                </pre>
              </div>

              {/* Optimal Solution if available */}
              {selectedAssessment.optimalSolution && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    Optimal Reference Solution
                  </h4>
                  <pre className="p-3.5 rounded-xl bg-card border border-border overflow-x-auto text-xs font-mono max-h-60 leading-relaxed text-foreground/90">
                    {selectedAssessment.optimalSolution}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
