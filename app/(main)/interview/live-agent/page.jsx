import React from "react";
import Link from "next/link";
import { ArrowLeft, PhoneCall, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import LiveAgentClient from "./_components/live-agent-client";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Live Audio Phone Screen Interview Agent | AI Career Coach",
  description:
    "Interactive, real-time audio phone screen interview agent with configurable personas, dynamic probing, and hiring bar scoring.",
};

export default async function LiveAgentPage() {
  const { userId } = await auth();

  let initialRole = "Senior Full-Stack Engineer";
  if (userId) {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });
    if (user?.industry) {
      initialRole = user.industry
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Link href="/interview">
          <Button
            variant="link"
            className="gap-2 pl-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation Hub
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-title">
            Phone Screen Interview Agent
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Real-time audio turn-taking, active architectural probing, and automated bar-raiser evaluation by Gemini AI.
          </p>
        </div>
      </div>

      <LiveAgentClient initialRole={initialRole} />
    </div>
  );
}
