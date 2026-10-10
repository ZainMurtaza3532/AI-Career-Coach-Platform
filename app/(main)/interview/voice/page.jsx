import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceInterviewRunner from "./_components/voice-interview-runner";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Voice Behavioral Mock Interview | AI Career Coach",
  description:
    "Practice behavioral interviews in real-time with Web Speech voice transcription, STAR criteria scoring, and executive coaching by Gemini AI.",
};

export default async function VoiceInterviewPage() {
  const { userId } = await auth();

  let initialRole = "Software Engineer";
  if (userId) {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });
    if (user?.industry) {
      // Format industry like "tech-software-development" into "Tech Software Development"
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
            Behavioral Mock Interview
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Real-time speech-to-text interview simulation with automated STAR scoring, filler word detection, and model answers.
          </p>
        </div>
      </div>

      <VoiceInterviewRunner initialRole={initialRole} />
    </div>
  );
}
