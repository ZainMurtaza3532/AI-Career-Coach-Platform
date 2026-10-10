"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CodingStatsCards from "./coding-stats-cards";
import CodingPerformanceChart from "./coding-performance-chart";
import CodingHistoryList from "./coding-history-list";
import CodingSessionModal from "./coding-session-modal";
import CodingWorkspace from "./coding-workspace";
import CodingResultsView from "./coding-results-view";
import { evaluateCodingSession } from "@/actions/coding";

export default function CodingHub({ initialAssessments = [], userProfile = {} }) {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [viewState, setViewState] = useState("DASHBOARD"); // "DASHBOARD" | "WORKSPACE" | "RESULTS"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleSessionStarted = (sessionData) => {
    setCurrentSession(sessionData);
    setViewState("WORKSPACE");
  };

  const handleExitWorkspace = () => {
    if (confirm("Are you sure you want to exit? In-progress solution buffers will be closed.")) {
      setViewState("DASHBOARD");
      setCurrentSession(null);
    }
  };

  const handleSubmitFinalSession = async (submissionPayload) => {
    setIsSubmitting(true);
    try {
      const res = await evaluateCodingSession(submissionPayload);
      if (res?.success && res.data) {
        setEvaluationData(res.data);
        setViewState("RESULTS");
        toast.success("Assessment evaluation completed!");

        // Synthesize new assessment records into state for immediate chart update
        const newAssessments = (res.data.problemEvaluations || []).map((pe, idx) => ({
          id: `new-${Date.now()}-${idx}`,
          problemId: pe.problemId,
          problemTitle: pe.problemTitle,
          language: submissionPayload.language || "javascript",
          code: submissionPayload.submissions?.[idx]?.code || "",
          status: pe.status || "ACCEPTED",
          score: pe.score || res.data.overallScore || 80,
          timeComplexity: pe.timeComplexity || "O(n)",
          spaceComplexity: pe.spaceComplexity || "O(1)",
          passedTests: submissionPayload.submissions?.[idx]?.testsPassed || 1,
          totalTests: submissionPayload.submissions?.[idx]?.testsTotal || 1,
          cleanCodeScore: pe.cleanCodeScore || 8,
          idiomaticScore: pe.idiomaticScore || 8,
          antiPatterns: pe.antiPatterns || [],
          feedback: pe.feedback || "",
          optimalSolution: pe.optimalSolution || "",
          createdAt: new Date().toISOString(),
        }));

        setAssessments((prev) => [...newAssessments, ...prev]);
      } else {
        throw new Error("Evaluation returned invalid data");
      }
    } catch (err) {
      console.error("Error evaluating session:", err);
      toast.error("Evaluation service error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToDashboard = () => {
    setViewState("DASHBOARD");
    setCurrentSession(null);
    setEvaluationData(null);
  };

  return (
    <div className="space-y-6">
      {/* Global Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/interview">
            <Button
              variant="link"
              className="gap-2 pl-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Interview Preparation Hub
            </Button>
          </Link>
          <div className="mt-1">
            <h1 className="text-4xl md:text-5xl font-bold gradient-title">
              Technical Coding Sandbox
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Live interactive coding environment with Monaco editor, runtime audits, and Big-O verification.
            </p>
          </div>
        </div>

        {viewState === "DASHBOARD" && (
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="gap-2 shrink-0 font-semibold shadow-md"
          >
            <Sparkles className="h-4 w-4" />
            Start New Coding Session
          </Button>
        )}
      </div>

      {/* VIEW STATE 1: DASHBOARD (Phase 1) */}
      {viewState === "DASHBOARD" && (
        <div className="space-y-6">
          {/* 1. Top KPI Summary Cards */}
          <CodingStatsCards assessments={assessments} />

          {/* 2. Performance Trends & Skill Breakdown */}
          <CodingPerformanceChart assessments={assessments} />

          {/* 3. Historical Sessions List */}
          <CodingHistoryList
            assessments={assessments}
            onStartNew={() => setIsModalOpen(true)}
          />
        </div>
      )}

      {/* VIEW STATE 2: FULL-SCREEN CODING WORKSPACE (Phase 4) */}
      {viewState === "WORKSPACE" && currentSession && (
        <CodingWorkspace
          sessionData={currentSession}
          onExitWorkspace={handleExitWorkspace}
          onSubmitFinalSession={handleSubmitFinalSession}
          isSubmittingSession={isSubmitting}
        />
      )}

      {/* VIEW STATE 3: RESULTS & DIAGNOSTIC SUMMARY (Phase 6) */}
      {viewState === "RESULTS" && evaluationData && (
        <CodingResultsView
          evaluationData={evaluationData}
          onReturnToDashboard={handleReturnToDashboard}
        />
      )}

      {/* MODAL: SESSION SETUP (Phase 2) */}
      <CodingSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSessionStarted={handleSessionStarted}
      />
    </div>
  );
}
