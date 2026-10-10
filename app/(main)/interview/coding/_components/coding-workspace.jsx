"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  Send,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  Code2,
  Terminal,
  Sparkles,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  ArrowLeft,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getProblemHint, runCodeTests } from "@/actions/coding";

// Dynamically import Monaco Editor to avoid SSR window references
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full flex flex-col items-center justify-center bg-card border border-border rounded-xl text-muted-foreground gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-sm font-medium">Loading Monaco Editor environment...</span>
    </div>
  ),
});

export default function CodingWorkspace({
  sessionData,
  onExitWorkspace,
  onSubmitFinalSession,
  isSubmittingSession = false,
}) {
  const { problems = [], language = "javascript", sessionId } = sessionData || {};
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);

  // Store user code per problem index: { [index]: codeString }
  const [problemCodes, setProblemCodes] = useState({});

  // Store problem test execution results: { [index]: { results, allPassed, passedCount, totalCount } }
  const [problemTestResults, setProblemTestResults] = useState({});

  // Store hints requested per problem: { [index]: [{ level, title, hint, recommendedAction }] }
  const [problemHints, setProblemHints] = useState({});

  // Console output per problem
  const [consoleOutputs, setConsoleOutputs] = useState({});

  // Active console tab: "tests" | "console" | "hints"
  const [activeConsoleTab, setActiveConsoleTab] = useState("tests");

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Per-action loading states
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // Active problem object
  const currentProblem = problems[activeProblemIndex] || problems[0] || {};

  // Initialize starter code for all problems on session launch
  useEffect(() => {
    if (problems.length > 0) {
      const initialCodes = {};
      problems.forEach((p, idx) => {
        initialCodes[idx] = p.starterCode || "";
      });
      setProblemCodes(initialCodes);
    }
  }, [problems]);

  // Stopwatch timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (newCode) => {
    setProblemCodes((prev) => ({
      ...prev,
      [activeProblemIndex]: newCode || "",
    }));
  };

  const handleResetCode = () => {
    const originalStarter = currentProblem?.starterCode || "";
    setProblemCodes((prev) => ({
      ...prev,
      [activeProblemIndex]: originalStarter,
    }));
    toast.info("Restored starter template for this problem.");
  };

  // Run Test Cases for Active Problem
  const handleRunTests = async () => {
    setIsRunningTests(true);
    setActiveConsoleTab("tests");

    const codeToTest = problemCodes[activeProblemIndex] || currentProblem.starterCode || "";
    const allCases = [
      ...(currentProblem.sampleTestCases || []),
      ...(currentProblem.hiddenTestCases || []),
    ];

    try {
      const res = await runCodeTests({
        code: codeToTest,
        language,
        problemTitle: currentProblem.title,
        testCases: allCases,
      });

      if (res?.success) {
        setProblemTestResults((prev) => ({
          ...prev,
          [activeProblemIndex]: res,
        }));
        if (res.stdout) {
          setConsoleOutputs((prev) => ({
            ...prev,
            [activeProblemIndex]: res.stdout,
          }));
        }

        if (res.allPassed) {
          toast.success(`All ${res.passedCount} test cases passed!`);
        } else {
          toast.warning(`${res.passedCount} of ${res.totalCount} tests passed.`);
        }
      }
    } catch (err) {
      console.error("Test runner error:", err);
      toast.error("Failed to run code tests. Please verify syntax.");
    } finally {
      setIsRunningTests(false);
    }
  };

  // Request Progressive Hint
  const handleRequestHint = async (level) => {
    setIsLoadingHint(true);
    setActiveConsoleTab("hints");

    const code = problemCodes[activeProblemIndex] || "";
    try {
      const res = await getProblemHint({
        problemId: currentProblem.id,
        code,
        language,
        level,
        problemTitle: currentProblem.title,
        problemDescription: currentProblem.description,
      });

      if (res?.success && res.data) {
        setProblemHints((prev) => {
          const current = prev[activeProblemIndex] || [];
          // Avoid duplicate hints for same level
          const filtered = current.filter((h) => h.level !== level);
          return {
            ...prev,
            [activeProblemIndex]: [...filtered, res.data],
          };
        });
        toast.info(`Unlocked Level ${level} Hint!`);
      }
    } catch (err) {
      console.error("Hint error:", err);
      toast.error("Unable to retrieve hint at this time.");
    } finally {
      setIsLoadingHint(false);
    }
  };

  // Submit Final Session
  const handleSubmitSession = () => {
    const submissions = problems.map((p, idx) => {
      const testResult = problemTestResults[idx];
      const allCases = [
        ...(p.sampleTestCases || []),
        ...(p.hiddenTestCases || []),
      ];
      return {
        problemId: p.id,
        problemTitle: p.title,
        difficulty: p.difficulty,
        topic: p.topic,
        code: problemCodes[idx] || p.starterCode || "",
        testsPassed: testResult?.passedCount ?? (testResult?.allPassed ? allCases.length : 0),
        testsTotal: allCases.length,
        hintsUsed: (problemHints[idx] || []).length,
        targetComplexity: p.targetComplexity,
        optimalSolution: p.optimalSolution || "",
      };
    });

    onSubmitFinalSession({
      sessionId,
      submissions,
      language,
      elapsedSeconds,
    });
  };

  const activeTestResult = problemTestResults[activeProblemIndex];
  const activeHints = problemHints[activeProblemIndex] || [];
  const activeConsole = consoleOutputs[activeProblemIndex] || "";

  // Map language to Monaco editor language
  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case "python":
        return "python";
      case "typescript":
        return "typescript";
      case "java":
        return "java";
      case "cpp":
        return "cpp";
      case "go":
        return "go";
      case "javascript":
      default:
        return "javascript";
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Problem Switcher, Timer, Run & Submit */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 rounded-xl border border-border bg-card/70 backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitWorkspace}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Exit
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Problem Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {problems.map((p, idx) => {
              const isSelected = activeProblemIndex === idx;
              const testRes = problemTestResults[idx];
              const isPassed = testRes?.allPassed;

              return (
                <Button
                  key={p.id || idx}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveProblemIndex(idx)}
                  className={`text-xs gap-1.5 h-8 transition-all ${
                    isSelected ? "shadow-sm" : "border-border/80"
                  }`}
                >
                  <span>P{idx + 1}</span>
                  <span className="hidden md:inline truncate max-w-[100px]">
                    {p.title?.split(" ")[0] || `Prob ${idx + 1}`}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : testRes ? (
                    <XCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  ) : null}
                </Button>
              );
            })}
          </div>

          <Badge variant="outline" className="text-[11px] font-mono uppercase">
            {language}
          </Badge>
          <Badge variant="secondary" className="text-[11px]">
            {currentProblem.difficulty || "Medium"}
          </Badge>
        </div>

        {/* Stopwatch & Action Controls */}
        <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunTests}
              disabled={isRunningTests || isSubmittingSession}
              className="gap-1.5 text-xs h-8"
            >
              {isRunningTests ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 text-primary" />
                  Run Tests
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handleSubmitSession}
              disabled={isSubmittingSession || isRunningTests}
              className="gap-1.5 text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSubmittingSession ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Submit Final Session
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Split View: Left (Problem Specs) & Right (Monaco & Console) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Problem Specifications (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm h-[720px] flex flex-col">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Problem {activeProblemIndex + 1} of {problems.length}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {currentProblem.topic || "Algorithms"}
                </span>
              </div>
              <CardTitle className="text-xl font-bold gradient-title mt-1">
                {currentProblem.title}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] bg-muted/50 px-2 py-0.5 rounded-md border border-border">
                  <Clock className="h-3 w-3" />
                  Target: {currentProblem.targetComplexity?.time || "O(n)"}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] bg-muted/50 px-2 py-0.5 rounded-md border border-border">
                  <HardDrive className="h-3 w-3" />
                  Space: {currentProblem.targetComplexity?.space || "O(1)"}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
              {/* Problem Statement */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Description
                </h4>
                <div className="whitespace-pre-wrap text-foreground/90 font-sans leading-relaxed">
                  {currentProblem.description}
                </div>
              </div>

              {/* Constraints */}
              {currentProblem.constraints?.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-muted/40 border border-border">
                  <h4 className="font-semibold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    Constraints
                  </h4>
                  <ul className="space-y-1 font-mono text-[11px] text-muted-foreground list-disc list-inside">
                    {currentProblem.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sample Test Cases */}
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Sample Test Cases
                </h4>
                <div className="space-y-2">
                  {(currentProblem.sampleTestCases || []).map((tc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-muted/30 border border-border font-mono text-[11px] space-y-1"
                    >
                      <div className="text-muted-foreground">
                        <span className="text-foreground font-semibold">Input: </span>
                        {tc.input}
                      </div>
                      <div className="text-muted-foreground">
                        <span className="text-primary font-semibold">Expected: </span>
                        {tc.expectedOutput}
                      </div>
                      {tc.explanation && (
                        <div className="text-[10px] text-muted-foreground font-sans italic pt-1">
                          {tc.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progressive Hint Drawer */}
              <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-primary" />
                    AI Hint Engine ("Co-Pilot")
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    Non-spoiler progressive tips
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Stuck on this problem? Unlock progressive architectural guidance without spoiling the solution code.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestHint(1)}
                    disabled={isLoadingHint}
                    className="text-[11px] h-7 gap-1"
                  >
                    Level 1: Intuition
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestHint(2)}
                    disabled={isLoadingHint}
                    className="text-[11px] h-7 gap-1"
                  >
                    Level 2: Data Structure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestHint(3)}
                    disabled={isLoadingHint}
                    className="text-[11px] h-7 gap-1"
                  >
                    Level 3: Pseudo-code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel: Monaco Editor & Bottom Console (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm h-[720px] flex flex-col overflow-hidden">
            {/* Editor Action Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Solution Buffer ({language})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCode}
                className="text-[11px] h-7 gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Reset Code
              </Button>
            </div>

            {/* Monaco Editor Component */}
            <div className="h-[430px] w-full border-b border-border">
              <MonacoEditor
                height="100%"
                language={getMonacoLanguage(language)}
                theme="vs-dark"
                value={problemCodes[activeProblemIndex] ?? currentProblem.starterCode ?? ""}
                onChange={handleCodeChange}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                  fontLigatures: true,
                  lineNumbersMinChars: 3,
                }}
              />
            </div>

            {/* Bottom Console Tabs */}
            <div className="flex-1 flex flex-col min-h-0 bg-background/80">
              <Tabs
                value={activeConsoleTab}
                onValueChange={setActiveConsoleTab}
                className="flex-1 flex flex-col"
              >
                <div className="px-3 pt-1 border-b border-border/80 flex items-center justify-between bg-muted/20">
                  <TabsList className="bg-transparent h-8 p-0 gap-2">
                    <TabsTrigger
                      value="tests"
                      className="text-xs h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md gap-1.5"
                    >
                      <Play className="h-3 w-3 text-primary" />
                      Test Results
                      {activeTestResult && (
                        <Badge
                          variant="secondary"
                          className="ml-1 text-[10px] px-1 py-0 h-4"
                        >
                          {activeTestResult.passedCount}/{activeTestResult.totalCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="console"
                      className="text-xs h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md gap-1.5"
                    >
                      <Terminal className="h-3 w-3" />
                      Console Output
                    </TabsTrigger>
                    <TabsTrigger
                      value="hints"
                      className="text-xs h-7 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Hints ({activeHints.length})
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab: Test Results */}
                <TabsContent
                  value="tests"
                  className="flex-1 p-3 overflow-y-auto m-0 text-xs space-y-2"
                >
                  {!activeTestResult ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                      <Play className="h-6 w-6 text-muted-foreground/60 mb-1" />
                      <p className="text-xs">
                        Click "Run Tests" to execute your solution against sample and edge cases.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className={activeTestResult.allPassed ? "text-emerald-500" : "text-amber-500"}>
                          {activeTestResult.allPassed
                            ? "✓ All assertions satisfied"
                            : `${activeTestResult.passedCount} of ${activeTestResult.totalCount} tests passed`}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(activeTestResult.results || []).map((res, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                              res.passed
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "border-red-500/30 bg-red-500/5"
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-foreground">
                                Case {idx + 1}
                              </span>
                              {res.passed ? (
                                <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-500">
                                  PASSED
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] border-red-500 text-red-500">
                                  FAILED
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Input: {res.input}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Expected: {res.expectedOutput}
                            </div>
                            <div className={`text-[11px] ${res.passed ? "text-emerald-400" : "text-red-400"}`}>
                              Your Output: {res.actualOutput || "undefined"}
                            </div>
                            {res.error && (
                              <div className="text-[10px] text-red-400 pt-0.5">
                                Error: {res.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Console Output */}
                <TabsContent
                  value="console"
                  className="flex-1 p-3 overflow-y-auto m-0 font-mono text-xs"
                >
                  {activeConsole ? (
                    <pre className="whitespace-pre-wrap text-foreground/90">
                      {activeConsole}
                    </pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                      No console logs captured yet. Use print() or console.log() in your code.
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Hints */}
                <TabsContent
                  value="hints"
                  className="flex-1 p-3 overflow-y-auto m-0 text-xs space-y-2.5"
                >
                  {!activeHints.length ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                      <Lightbulb className="h-6 w-6 text-muted-foreground/60 mb-1" />
                      <p className="text-xs">
                        No hints requested yet. Click the Hint buttons in the left panel if you get stuck.
                      </p>
                    </div>
                  ) : (
                    activeHints.map((h, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-1"
                      >
                        <div className="flex items-center justify-between text-primary font-semibold text-xs">
                          <span>{h.title}</span>
                          <Badge variant="outline" className="text-[10px]">
                            Level {h.level}
                          </Badge>
                        </div>
                        <p className="text-foreground/90 text-xs leading-relaxed">
                          {h.hint}
                        </p>
                        {h.recommendedAction && (
                          <p className="text-[11px] text-muted-foreground italic pt-1">
                            Action: {h.recommendedAction}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
