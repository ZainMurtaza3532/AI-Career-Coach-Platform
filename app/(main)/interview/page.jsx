import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, PhoneCall, Mic, Code2 } from "lucide-react";
import { checkUser } from "@/lib/checkUser";
import { getIndustryCapabilities } from "@/lib/industryCapabilities";

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
            Practice domain quizzes, phone screen agents, and behavioral mocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {capabilities.hasCodingSandbox && (
            <Link href="/interview/coding">
              <Button variant="outline" className="gap-2 border-primary/40 shadow-sm text-xs sm:text-sm">
                <Code2 className="h-4 w-4" />
                Coding Sandbox
              </Button>
            </Link>
          )}
          <Link href="/interview/live-agent">
            <Button variant="outline" className="gap-2 border-primary/40 shadow-sm text-xs sm:text-sm">
              <Phone className="h-4 w-4" />
              Live Phone Agent
            </Button>
          </Link>
          <Link href="/interview/phone-screen">
            <Button variant="default" className="gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm text-xs sm:text-sm font-semibold">
              <PhoneCall className="h-4 w-4" />
              Live Phone Screen
            </Button>
          </Link>
          <Link href="/interview/voice">
            <Button variant="outline" className="gap-2 border-primary/40 shadow-sm text-xs sm:text-sm">
              <Mic className="h-4 w-4" />
              Voice Behavioral Mock
            </Button>
          </Link>
        </div>
      </div>

      <StatsCards assessments={assessments} />
      <PerformanceChart assessments={assessments} />
      <QuizList assessments={assessments} />
    </div>
  );
}
