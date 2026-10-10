import React from "react";
import Link from "next/link";
import { ArrowLeft, Share2, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LinkedInProfileGenerator from "./_components/linkedin-profile-generator";
import ColdOutreachGenerator from "./_components/cold-outreach-generator";

export const metadata = {
  title: "AI LinkedIn & Networking Generator | AI Career Coach",
  description:
    "Generate magnetic LinkedIn headlines, narrative About summaries, and high-conversion cold outreach InMail messages using Google Gemini AI.",
};

export default function NetworkingPage() {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col space-y-2">
        <Link href="/dashboard">
          <Button
            variant="link"
            className="gap-2 pl-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-title">
              AI LinkedIn & Networking
            </h1>
            <p className="text-muted-foreground text-sm md:text-base mt-1">
              Elevate your executive brand on LinkedIn and craft high-response cold outreach messages.
            </p>
          </div>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <Tabs defaultValue="linkedin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/60 p-1 rounded-xl max-w-md">
          <TabsTrigger value="linkedin" className="gap-2 text-xs md:text-sm">
            <Share2 className="h-4 w-4" />
            LinkedIn Profile
          </TabsTrigger>
          <TabsTrigger value="outreach" className="gap-2 text-xs md:text-sm">
            <Send className="h-4 w-4" />
            Cold Outreach & InMail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="linkedin" className="mt-6">
          <LinkedInProfileGenerator />
        </TabsContent>

        <TabsContent value="outreach" className="mt-6">
          <ColdOutreachGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
