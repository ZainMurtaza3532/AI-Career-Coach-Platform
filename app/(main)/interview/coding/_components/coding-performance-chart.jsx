"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { LineChart as ChartIcon, Layers } from "lucide-react";

export default function CodingPerformanceChart({ assessments = [] }) {
  // 1. Time-series score progression
  const timelineData = useMemo(() => {
    if (!assessments.length) return [];
    // Sort chronological ascending
    const sorted = [...assessments].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted.map((a, i) => ({
      index: i + 1,
      date: format(new Date(a.createdAt), "MMM dd"),
      score: Math.round(a.score || 0),
      title: a.problemTitle || `Challenge ${i + 1}`,
      language: a.language || "javascript",
    }));
  }, [assessments]);

  // 2. Topic/Skill distribution & mastery
  const topicData = useMemo(() => {
    if (!assessments.length) return [];
    const topicMap = {};
    for (const a of assessments) {
      const topic = a.topic || "Algorithms";
      if (!topicMap[topic]) {
        topicMap[topic] = { topic, count: 0, totalScore: 0 };
      }
      topicMap[topic].count += 1;
      topicMap[topic].totalScore += a.score || 0;
    }
    return Object.values(topicMap).map((t) => ({
      topic: t.topic.length > 16 ? `${t.topic.substring(0, 14)}...` : t.topic,
      fullTopic: t.topic,
      challenges: t.count,
      avgScore: Math.round(t.totalScore / t.count),
    }));
  }, [assessments]);

  if (!assessments.length) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="gradient-title text-2xl md:text-3xl flex items-center gap-2">
            <ChartIcon className="h-6 w-6 text-primary" />
            Performance & Algorithmic Trends
          </CardTitle>
          <CardDescription>
            Historical progression and topic breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl border-border/80">
            <p className="text-sm font-medium text-foreground">
              No historical coding assessments yet
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Complete your first session above to populate your performance trajectory, complexity ratings, and category mastery breakdown.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Score Progression Trend */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="gradient-title text-xl md:text-2xl flex items-center gap-2">
            <ChartIcon className="h-5 w-5 text-primary" />
            Score Trajectory
          </CardTitle>
          <CardDescription>
            Chronological evaluation score across submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="codingScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{data.title}</p>
                          <p className="text-muted-foreground">Date: {data.date}</p>
                          <p className="text-primary font-bold">Score: {data.score}%</p>
                          <p className="text-[11px] text-muted-foreground capitalize">
                            Language: {data.language}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#codingScoreGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Skill / Topic Breakdown */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="gradient-title text-xl md:text-2xl flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Topic & Pattern Mastery
          </CardTitle>
          <CardDescription>
            Average performance by algorithmic category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border rounded-lg p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold text-foreground">{data.fullTopic}</p>
                          <p className="text-primary font-bold">Average Score: {data.avgScore}%</p>
                          <p className="text-muted-foreground">
                            Challenges Completed: {data.challenges}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="avgScore"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  name="Avg Score (%)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
