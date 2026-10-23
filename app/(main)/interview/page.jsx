import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, BookOpen } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { getIndustryCapabilities } from "@/lib/industryCapabilities";

export const metadata = {
  title: "Interview Preparation & Performance Hub",
  description:
    "Prepare for technical domain and coding interviews with live assessments, Monaco code sandbox, and performance tracking.",
};

export default async function InterviewPrepPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const isRestricted = resolvedParams?.restricted === "coding-sandbox";

  const [assessments, user] = await Promise.all([
    getAssessments(),
    checkUser(),
  ]);
  const capabilities = getIndustryCapabilities(user?.industry);

  return (
    <div className="space-y-6">
      {isRestricted && (
        <div className="p-4 rounded-xl border border-border bg-muted/60 flex items-center gap-3 text-xs sm:text-sm animate-fade-in">
          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
          <p className="text-muted-foreground">
            <strong className="text-foreground">Profile Adaptation:</strong> The Technical Coding Sandbox is tailored for software engineering profiles. Your workspace has been customized for <strong>{capabilities.domainTerm}</strong>.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-title">
            Interview Preparation
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Master technical domain quizzes, algorithmic problem-solving, and track your assessment growth.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/interview/mock">
            <Button variant="outline" className="gap-2 border-primary/40 shadow-sm text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              Domain Assessment Quiz
            </Button>
          </Link>
          {capabilities.hasCodingSandbox && (
            <Link href="/interview/coding">
              <Button variant="default" className="gap-2 shadow-sm text-xs sm:text-sm">
                <Code2 className="h-4 w-4" />
                Coding Sandbox
              </Button>
            </Link>
          )}
        </div>
      </div>

      <StatsCards assessments={assessments} />
      <PerformanceChart assessments={assessments} />
      <QuizList assessments={assessments} />
    </div>
  );
}
