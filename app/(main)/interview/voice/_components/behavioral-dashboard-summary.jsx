"use client";

import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Clock,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import Link from "next/link";

export default function BehavioralDashboardSummary({
  interviewData,
  onRestart,
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const {
    targetRole = "Software Engineer",
    overallScore = 0,
    starScores = {
      situation: 0,
      task: 0,
      action: 0,
      result: 0,
      clarity: 0,
    },
    questions = [],
    feedback = "",
  } = interviewData || {};

  // Prepare radar chart data
  const radarData = [
    {
      subject: "Situation",
      score: Number(starScores.situation?.toFixed(1) || 0),
      fullMark: 10,
    },
    {
      subject: "Task",
      score: Number(starScores.task?.toFixed(1) || 0),
      fullMark: 10,
    },
    {
      subject: "Action",
      score: Number(starScores.action?.toFixed(1) || 0),
      fullMark: 10,
    },
    {
      subject: "Result",
      score: Number(starScores.result?.toFixed(1) || 0),
      fullMark: 10,
    },
    {
      subject: "Clarity",
      score: Number(starScores.clarity?.toFixed(1) || 0),
      fullMark: 10,
    },
  ];

  // Calculate cumulative filler words across all 5 questions
  const totalFillers = questions.reduce((sum, q) => {
    return sum + (q.evaluation?.totalFillerCount || 0);
  }, 0);

  const totalWords = questions.reduce((sum, q) => {
    return sum + (q.transcript ? q.transcript.split(/\s+/).length : 0);
  }, 0);

  const getReadinessBadge = (score) => {
    if (score >= 8.5) {
      return {
        label: "Offer-Ready ⭐",
        variant: "default",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
        description:
          "Exceptional delivery with comprehensive STAR metrics and leadership impact.",
      };
    }
    if (score >= 7.0) {
      return {
        label: "Strong Candidate 👍",
        variant: "secondary",
        color: "text-blue-400 bg-blue-500/10 border-blue-500/30",
        description:
          "Solid responses. Sharpen your quantifiable results and reduce filler words.",
      };
    }
    return {
      label: "Needs Practice 🎯",
      variant: "destructive",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      description:
        "Focus on specific actions ('I did' vs 'We did') and state measurable business outcomes.",
    };
  };

  const readiness = getReadinessBadge(overallScore);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Rewritten answer copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary/30">
              Target Role: {targetRole}
            </Badge>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${readiness.color}`}
            >
              {readiness.label}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Behavioral Interview Assessment
          </h2>
          <p className="text-sm text-muted-foreground">
            Complete STAR framework analysis evaluated by Google Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onRestart}
            className="gap-2 border-primary/30 hover:bg-primary/10"
          >
            <RotateCcw className="h-4 w-4" />
            Retake Interview
          </Button>
          <Link href="/interview">
            <Button className="gap-2">
              Back to Interview Hub
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Overall STAR Score
            </CardTitle>
            <Trophy className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {overallScore.toFixed(1)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / 10
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Weighted STAR & delivery average
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Action & Result
            </CardTitle>
            <Target className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {(
                ((starScores.action || 0) + (starScores.result || 0)) /
                2
              ).toFixed(1)}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / 10
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ownership & measurable impact
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Filler Words
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {totalFillers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Detected across 5 answers
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Spoken Word Count
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {totalWords}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {Math.round(totalWords / 5)} words per response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Navigation */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/60 p-1 rounded-xl">
          <TabsTrigger value="overview">Overview & Radar</TabsTrigger>
          <TabsTrigger value="star">STAR Breakdown</TabsTrigger>
          <TabsTrigger value="questions">Questions & Rewrites</TabsTrigger>
          <TabsTrigger value="delivery">Speech & Delivery</TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & RADAR */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Radar Chart */}
            <Card className="border border-border/60 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  STAR Competency Radar
                </CardTitle>
                <CardDescription>
                  Multi-axial breakdown across all 5 evaluation dimensions
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[340px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="75%"
                    data={radarData}
                  >
                    <PolarGrid stroke="#374151" strokeDasharray="3 3" />
                    <PolarAngleAxis
                      dataKey="subject"
                      stroke="#9ca3af"
                      tick={{ fill: "#9ca3af", fontSize: 13 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      stroke="#4b5563"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-2.5 shadow-xl text-xs">
                              <p className="font-semibold text-foreground">
                                {payload[0].payload.subject}
                              </p>
                              <p className="text-primary font-bold">
                                Score: {payload[0].value} / 10
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Executive Summary Card */}
            <Card className="border border-border/60 shadow-md flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Executive Coaching Verdict
                  </CardTitle>
                  <CardDescription>{readiness.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-sm leading-relaxed">
                    {feedback ||
                      "Your responses demonstrate strong subject matter expertise and clear problem-solving instinct. To maximize behavioral interview pass rates, ensure you clearly distinguish your personal contributions from general team activities and substantiate every outcome with concrete metrics."}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dimension Ratings
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
                        <span className="text-muted-foreground">Situation:</span>
                        <span className="font-bold">
                          {starScores.situation?.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
                        <span className="text-muted-foreground">Task:</span>
                        <span className="font-bold">
                          {starScores.task?.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
                        <span className="text-muted-foreground">Action:</span>
                        <span className="font-bold">
                          {starScores.action?.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-background/50 border">
                        <span className="text-muted-foreground">Result:</span>
                        <span className="font-bold">
                          {starScores.result?.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0">
                <Button
                  onClick={onRestart}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4" /> Practice Another 5 Questions
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: STAR BREAKDOWN */}
        <TabsContent value="star" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Situation */}
            <Card className="border border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-blue-500/40 text-blue-400">
                    S - Situation
                  </Badge>
                  <span className="text-lg font-bold text-blue-400">
                    {starScores.situation?.toFixed(1)} / 10
                  </span>
                </div>
                <CardTitle className="text-base mt-2">
                  Context & Background Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Did you provide concise yet necessary context (company, team,
                  constraints, project scope) without getting lost in trivial
                  details?
                </p>
                <div className="p-3 rounded-lg bg-muted/40 border text-xs">
                  <span className="font-semibold text-foreground">
                    Coaching Advice:
                  </span>{" "}
                  Keep the situation under 20-30 seconds. State the project,
                  timeline, and stakes quickly so the interviewer understands the
                  context immediately.
                </div>
              </CardContent>
            </Card>

            {/* Task */}
            <Card className="border border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-indigo-500/40 text-indigo-400"
                  >
                    T - Task
                  </Badge>
                  <span className="text-lg font-bold text-indigo-400">
                    {starScores.task?.toFixed(1)} / 10
                  </span>
                </div>
                <CardTitle className="text-base mt-2">
                  Goal & Dilemma Definition
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Did you articulate your personal responsibility and the core
                  conflict or challenge that needed resolution?
                </p>
                <div className="p-3 rounded-lg bg-muted/40 border text-xs">
                  <span className="font-semibold text-foreground">
                    Coaching Advice:
                  </span>{" "}
                  Explicitly state: &quot;My objective was to...&quot; or &quot;The
                  obstacle we faced was...&quot; to make the goal crystal clear.
                </div>
              </CardContent>
            </Card>

            {/* Action */}
            <Card className="border border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-purple-500/40 text-purple-400"
                  >
                    A - Action
                  </Badge>
                  <span className="text-lg font-bold text-purple-400">
                    {starScores.action?.toFixed(1)} / 10
                  </span>
                </div>
                <CardTitle className="text-base mt-2">
                  Personal Ownership & Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Did you describe the specific steps you took, tools you used,
                  and strategic decisions you led, rather than hiding behind
                  &quot;we&quot;?
                </p>
                <div className="p-3 rounded-lg bg-muted/40 border text-xs">
                  <span className="font-semibold text-foreground">
                    Coaching Advice:
                  </span>{" "}
                  This should form 50-60% of your answer. Highlight leadership,
                  active listening, and systematic problem solving.
                </div>
              </CardContent>
            </Card>

            {/* Result */}
            <Card className="border border-border/60">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-400"
                  >
                    R - Result
                  </Badge>
                  <span className="text-lg font-bold text-emerald-400">
                    {starScores.result?.toFixed(1)} / 10
                  </span>
                </div>
                <CardTitle className="text-base mt-2">
                  Quantifiable Impact & Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  Did you close with measurable business outcomes (e.g., &quot;reduced
                  latency by 40%&quot;, &quot;delivered 2 weeks early&quot;) and long-term
                  learning?
                </p>
                <div className="p-3 rounded-lg bg-muted/40 border text-xs">
                  <span className="font-semibold text-foreground">
                    Coaching Advice:
                  </span>{" "}
                  Always quantify the win. If exact revenue/speed metrics aren&apos;t
                  available, highlight stakeholder adoption and lessons learned.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: QUESTIONS & REWRITTEN ANSWERS */}
        <TabsContent value="questions" className="space-y-4 mt-6">
          <p className="text-sm text-muted-foreground">
            Review your spoken transcript alongside AI STAR critiques and
            executive rewritten model answers for all 5 questions.
          </p>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {questions.map((q, idx) => {
              const evalData = q.evaluation || {};
              const scores = evalData.scores || {};

              return (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="border rounded-xl px-4 py-2 bg-card/60"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left pr-4 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm md:text-base text-foreground">
                            {q.question}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            Category: {q.category || "Behavioral Competency"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs"
                        >
                          Score: {scores.overall?.toFixed(1) || 0}/10
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pt-4 space-y-4 text-sm border-t mt-2">
                    {/* Scores row */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                      <div className="p-2 rounded bg-muted/50 border text-center">
                        <div className="text-muted-foreground">Situation</div>
                        <div className="font-bold text-sm">
                          {scores.situation || 0}/10
                        </div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 border text-center">
                        <div className="text-muted-foreground">Task</div>
                        <div className="font-bold text-sm">
                          {scores.task || 0}/10
                        </div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 border text-center">
                        <div className="text-muted-foreground">Action</div>
                        <div className="font-bold text-sm">
                          {scores.action || 0}/10
                        </div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 border text-center">
                        <div className="text-muted-foreground">Result</div>
                        <div className="font-bold text-sm">
                          {scores.result || 0}/10
                        </div>
                      </div>
                      <div className="p-2 rounded bg-muted/50 border text-center">
                        <div className="text-muted-foreground">Clarity</div>
                        <div className="font-bold text-sm">
                          {scores.clarity || 0}/10
                        </div>
                      </div>
                    </div>

                    {/* Candidate Transcript */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Your Spoken Transcript:
                      </h4>
                      <p className="p-3 rounded-lg bg-background border font-sans text-xs md:text-sm text-foreground/90 leading-relaxed italic">
                        &quot;{q.transcript}&quot;
                      </p>
                    </div>

                    {/* Filler Words */}
                    {evalData.fillerWords && evalData.fillerWords.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground font-medium">
                          Filler Words:
                        </span>
                        {evalData.fillerWords.map((fw, fwIdx) => (
                          <Badge
                            key={fwIdx}
                            variant="destructive"
                            className="text-[11px] px-2 py-0"
                          >
                            &quot;{fw.word}&quot; (x{fw.count})
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Strengths & Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {evalData.strengths?.length > 0 && (
                        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                          <p className="font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
                          </p>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {evalData.strengths.map((str, sIdx) => (
                              <li key={sIdx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {evalData.improvements?.length > 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
                          <p className="font-semibold text-amber-400 flex items-center gap-1">
                            <AlertCircle className="h-3.5 w-3.5" /> Growth Areas
                          </p>
                          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                            {evalData.improvements.map((imp, iIdx) => (
                              <li key={iIdx}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* AI Model Rewritten Answer */}
                    {evalData.rewrittenAnswer && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                            <Sparkles className="h-3.5 w-3.5" /> Exemplary STAR
                            Rewritten Answer
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                            onClick={() =>
                              copyToClipboard(evalData.rewrittenAnswer, idx)
                            }
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-sans">
                          {evalData.rewrittenAnswer}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </TabsContent>

        {/* TAB 4: SPEECH & DELIVERY */}
        <TabsContent value="delivery" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-400" />
                  Filler Word Analysis
                </CardTitle>
                <CardDescription>
                  Tracking subconscious speech disfluencies (um, like,
                  basically)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border">
                  <div>
                    <div className="text-2xl font-black">{totalFillers}</div>
                    <div className="text-xs text-muted-foreground">
                      Total filler words across entire interview
                    </div>
                  </div>
                  <Badge
                    variant={totalFillers <= 3 ? "default" : "destructive"}
                  >
                    {totalFillers <= 3
                      ? "Polished & Articulate"
                      : "Pacing Improvement Needed"}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">
                    Pro Tips for Eliminating Fillers:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      <strong>Embrace the pause:</strong> When formulating a
                      thought, pause silently for 2 seconds instead of saying
                      &quot;um&quot; or &quot;like&quot;.
                    </li>
                    <li>
                      <strong>Signpost your answers:</strong> Start by outlining:
                      &quot;I tackled that challenge in three key steps...&quot;
                    </li>
                    <li>
                      <strong>Breathe before answering:</strong> Inhale deeply
                      before initiating your Situation sentence.
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  Pacing & Delivery Metrics
                </CardTitle>
                <CardDescription>
                  Speech economy and structural distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border">
                    <span className="text-muted-foreground">
                      Total Spoken Volume:
                    </span>
                    <span className="font-bold text-foreground">
                      {totalWords} words
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border">
                    <span className="text-muted-foreground">
                      Average Length per Answer:
                    </span>
                    <span className="font-bold text-foreground">
                      ~{Math.round(totalWords / 5)} words (Target: 150-250
                      words)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border">
                    <span className="text-muted-foreground">
                      Delivery Clarity Score:
                    </span>
                    <span className="font-bold text-primary">
                      {starScores.clarity?.toFixed(1) || 0} / 10
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    Optimal Duration:
                  </span>{" "}
                  An ideal behavioral response is 90 to 120 seconds long (approx.
                  180-220 words). If your answer is under 60 words, you likely
                  omitted the Task or Result metrics.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
