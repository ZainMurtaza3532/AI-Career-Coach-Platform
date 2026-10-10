"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Mic, Sparkles, Target, Award, ArrowRight } from "lucide-react";
import BehavioralDashboardSummary from "../voice/_components/behavioral-dashboard-summary";

export default function BehavioralList({ behavioralInterviews = [] }) {
  const router = useRouter();
  const [selectedInterview, setSelectedInterview] = useState(null);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="gradient-title text-3xl md:text-4xl">
                  Behavioral Interviews
                </CardTitle>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  STAR AI
                </Badge>
              </div>
              <CardDescription>
                Review your voice & behavioral simulation scores and coaching feedback
              </CardDescription>
            </div>
            <Button
              className="gap-2"
              onClick={() => router.push("/interview/voice")}
            >
              <Mic className="h-4 w-4" />
              Practice Voice Mock
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!behavioralInterviews || behavioralInterviews.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
              <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <h3 className="font-semibold text-base mb-1">No behavioral interviews yet</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-4">
                Practice real-time behavioral interview questions with speech-to-text, STAR framework scoring, and model answers.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={() => router.push("/interview/voice")}
              >
                Start Voice Interview
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {behavioralInterviews.map((interview, index) => {
                const score = Number(interview.overallScore || 0);
                const scoreColor =
                  score >= 8
                    ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                    : score >= 6
                    ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                    : "text-rose-500 border-rose-500/30 bg-rose-500/10";

                return (
                  <Card
                    key={interview.id || index}
                    className="cursor-pointer hover:bg-muted/50 transition-all border border-border/70 hover:border-primary/40 shadow-sm"
                    onClick={() => setSelectedInterview(interview)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg font-semibold flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-primary" />
                            {interview.targetRole || "Behavioral Mock"}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {format(
                              new Date(interview.createdAt),
                              "MMMM dd, yyyy · HH:mm"
                            )}
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className={`font-bold text-sm px-2.5 py-0.5 ${scoreColor}`}
                        >
                          {score.toFixed(1)} / 10
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {interview.feedback ||
                          "Completed behavioral interview evaluation using STAR criteria."}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedInterview}
        onOpenChange={() => setSelectedInterview(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Behavioral Interview STAR Breakdown
            </DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <BehavioralDashboardSummary
              interviewData={{
                targetRole: selectedInterview.targetRole,
                overallScore: selectedInterview.overallScore,
                starScores: selectedInterview.starScores,
                questions: selectedInterview.questions,
                feedback: selectedInterview.feedback,
              }}
              onRestart={() => {
                setSelectedInterview(null);
                router.push("/interview/voice");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
