"use client";

import React, { useState } from "react";
import {
  Send,
  Mail,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Lightbulb,
  Building,
  User,
  Target,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateColdMessage } from "@/actions/networking";

const INTENTS = [
  { id: "Job Referral", label: "Job Referral", desc: "Request an internal referral for an open role" },
  { id: "Hiring Manager Pitch", label: "Hiring Manager Pitch", desc: "Direct pitch to the prospective manager" },
  { id: "Informational Interview", label: "Informational Chat", desc: "Ask for brief 10-min career insights" },
  { id: "Casual Connection", label: "Casual Network", desc: "Low-pressure connection based on shared interest" },
];

export default function ColdOutreachGenerator() {
  const [formData, setFormData] = useState({
    targetRole: "",
    companyName: "",
    recipientTitle: "Engineering Manager",
    intent: "Job Referral",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.targetRole.trim() || !formData.companyName.trim()) {
      toast.error("Please fill in Target Role and Company Name.");
      return;
    }

    setLoading(true);
    try {
      const data = await generateColdMessage(formData);
      setResult(data);
      toast.success("Cold outreach messages generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate outreach messages.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  };

  return (
    <div className="space-y-6">
      {/* Input Parameters Form */}
      <Card className="border border-border/70 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Outreach Context & Targeting
          </CardTitle>
          <CardDescription>
            Specify your recipient and networking objective to generate high-conversion messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="targetRole" className="text-xs font-semibold">
                  Target Role / Opportunity *
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetRole"
                    placeholder="e.g. Senior Frontend Engineer"
                    className="pl-9 text-sm"
                    value={formData.targetRole}
                    onChange={(e) =>
                      setFormData({ ...formData, targetRole: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-xs font-semibold">
                  Target Company *
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="e.g. Stripe, Airbnb, Datadog"
                    className="pl-9 text-sm"
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="recipientTitle"
                  className="text-xs font-semibold"
                >
                  Recipient Title / Role
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="recipientTitle"
                    placeholder="e.g. Engineering Manager, Recruiter"
                    className="pl-9 text-sm"
                    value={formData.recipientTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientTitle: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Intent Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                Networking Intent & Objective
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {INTENTS.map((intent) => (
                  <button
                    key={intent.id}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, intent: intent.id })
                    }
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.intent === intent.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow"
                        : "border-border/60 bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="font-semibold text-xs text-foreground">
                      {intent.label}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {intent.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="gap-2 font-semibold shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating InMail Messages with Gemini...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Outreach Variants
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Section 1: Subject Lines */}
          {result.subjectLines && result.subjectLines.length > 0 && (
            <Card className="border border-border/70 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail className="h-5 w-5 text-indigo-400" />
                  High-Open-Rate Subject Lines
                </CardTitle>
                <CardDescription>
                  Concise, professional subject lines under 50 characters
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2.5">
                {result.subjectLines.map((subj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs px-2"
                      >
                        #{idx + 1}
                      </Badge>
                      <span className="font-medium text-sm text-foreground">
                        {subj}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(subj, `subj-${idx}`)}
                      className="shrink-0 text-xs gap-1 h-7"
                    >
                      {copiedKey === `subj-${idx}` ? (
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
                ))}
              </CardContent>
            </Card>
          )}

          {/* Section 2: Two Message Variants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Variant A: Short InMail (Under 100 words) */}
            <Card className="border border-border/70 shadow-lg flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="text-primary border-primary/30">
                          Short InMail
                        </Badge>
                        Quick Outreach
                      </CardTitle>
                      <CardDescription>
                        Ideal for LinkedIn Connection Invites (under 100 words)
                      </CardDescription>
                    </div>

                    <Badge variant="secondary" className="font-mono text-xs">
                      {getWordCount(result.shortMessage)} words
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="p-4 rounded-xl bg-background border text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
                    {result.shortMessage}
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0 flex justify-end">
                <Button
                  size="sm"
                  onClick={() =>
                    copyToClipboard(result.shortMessage, "short-msg")
                  }
                  className="gap-1.5 text-xs"
                >
                  {copiedKey === "short-msg" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied Message
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Short Message
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Variant B: Full Email / Detailed InMail (Under 200 words) */}
            <Card className="border border-border/70 shadow-lg flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                          Full Outreach
                        </Badge>
                        In-Depth Message
                      </CardTitle>
                      <CardDescription>
                        Ideal for Direct Email or Premium InMail (under 200 words)
                      </CardDescription>
                    </div>

                    <Badge variant="secondary" className="font-mono text-xs">
                      {getWordCount(result.fullMessage)} words
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="p-4 rounded-xl bg-background border text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90">
                    {result.fullMessage}
                  </div>
                </CardContent>
              </div>

              <div className="p-6 pt-0 flex justify-end">
                <Button
                  size="sm"
                  onClick={() =>
                    copyToClipboard(result.fullMessage, "full-msg")
                  }
                  className="gap-1.5 text-xs"
                >
                  {copiedKey === "full-msg" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied Message
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Full Message
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Section 3: Tactical Networking Pro Tip */}
          {result.proTip && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20 flex items-start gap-3 shadow-md">
              <Lightbulb className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs md:text-sm">
                <p className="font-semibold text-foreground">
                  Tactical Follow-Up Advice
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {result.proTip}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
