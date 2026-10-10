"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  Share2,
  Tag,
  FileText,
  BadgeCheck,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateLinkedInProfile } from "@/actions/networking";

const TONES = [
  { id: "Technical Leader", label: "Technical Leader", desc: "Architecture, engineering rigor & tech influence" },
  { id: "Direct & Impactful", label: "Direct & Impactful", desc: "Results-first, high metrics & business outcomes" },
  { id: "Story-driven & Human", label: "Story-Driven", desc: "Authentic journey, philosophy & collaboration" },
  { id: "Executive & Visionary", label: "Executive", desc: "Strategic leadership, scaling teams & vision" },
];

export default function LinkedInProfileGenerator() {
  const [selectedTone, setSelectedTone] = useState("Technical Leader");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const data = await generateLinkedInProfile(selectedTone);
      setResult(data);
      toast.success("LinkedIn profile assets generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to generate LinkedIn profile.");
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

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card className="border border-border/70 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Brand Tone & Persona
          </CardTitle>
          <CardDescription>
            Choose the voice that best aligns with your career target and personal brand.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TONES.map((tone) => (
              <button
                key={tone.id}
                type="button"
                onClick={() => setSelectedTone(tone.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedTone === tone.id
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow"
                    : "border-border/60 bg-card hover:bg-muted/40"
                }`}
              >
                <div className="font-semibold text-sm text-foreground flex items-center justify-between">
                  {tone.label}
                  {selectedTone === tone.id && (
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {tone.desc}
                </p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="gap-2 font-semibold shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Crafting LinkedIn Profile with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate LinkedIn Assets
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results View */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Section 1: Hook Headlines */}
          <Card className="border border-border/70 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-emerald-400" />
                    High-Converting LinkedIn Headlines
                  </CardTitle>
                  <CardDescription>
                    3 distinct headline angles designed to boost search rankings and profile clicks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {result.headlines?.map((headline, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">
                        Option {idx + 1}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({headline.length} / 220 chars)
                      </span>
                    </div>
                    <p className="font-medium text-sm text-foreground leading-relaxed">
                      {headline}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(headline, `headline-${idx}`)}
                    className="shrink-0 text-xs gap-1.5 h-8 self-end sm:self-center"
                  >
                    {copiedKey === `headline-${idx}` ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Section 2: Narrative About Section */}
          <Card className="border border-border/70 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-400" />
                    Compelling &quot;About&quot; Summary
                  </CardTitle>
                  <CardDescription>
                    Structured narrative with an opening hook, technical highlights, and call to action
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {result.about?.length || 0} / 2,600 chars
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(result.about, "about")}
                    className="gap-1.5 text-xs h-8"
                  >
                    {copiedKey === "about" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy About
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="p-5 rounded-xl bg-background border border-border/70 text-sm leading-relaxed whitespace-pre-wrap font-sans text-foreground/90 selection:bg-primary/20">
                {result.about}
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Featured Keywords & Skills */}
          {result.skills && result.skills.length > 0 && (
            <Card className="border border-border/70 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5 text-purple-400" />
                      Recommended Keywords & Skills
                    </CardTitle>
                    <CardDescription>
                      High-visibility search terms to feature on your profile skills list
                    </CardDescription>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(result.skills.join(", "), "skills-all")
                    }
                    className="text-xs gap-1.5 h-8"
                  >
                    {copiedKey === "skills-all" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        Copied All
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, sIdx) => (
                    <Badge
                      key={sIdx}
                      variant="secondary"
                      className="px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => copyToClipboard(skill, `skill-${sIdx}`)}
                      title="Click to copy skill"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
