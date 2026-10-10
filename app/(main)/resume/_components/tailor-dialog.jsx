"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Target, CheckCircle2, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { tailorResumeToJob } from "@/actions/resume";

export default function TailorDialog({
  isOpen,
  onClose,
  activeResume,
  onTailoredSuccess,
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [saveAsNew, setSaveAsNew] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleTailor = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      toast.error("Please paste a job description with at least 20 characters.");
      return;
    }

    setIsLoading(true);
    try {
      toast.info("Gemini 2.5 Flash is tailoring achievement bullets to target job...");
      const result = await tailorResumeToJob(activeResume.id, jobDescription, saveAsNew);
      toast.success(
        saveAsNew
          ? "Created new job-tailored resume version!"
          : "Resume updated with tailored achievements!"
      );
      if (onTailoredSuccess) {
        onTailoredSuccess(result);
      }
      onClose();
      setJobDescription("");
    } catch (error) {
      console.error("Tailor error:", error);
      toast.error(error.message || "Failed to tailor resume");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose(open)}>
      <DialogContent className="max-w-2xl bg-card border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Tailor Resume with Gemini 2.5 Flash
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Targeting: <span className="font-semibold text-foreground">{activeResume?.title || "Current Resume"}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>ATS Keyword Injection</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
              <span>Quantified Metrics</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
              <span>Zero Fabrication</span>
            </div>
          </div>

          {/* Job Description Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between">
              <span>Target Job Description</span>
              <span className="text-xs text-muted-foreground">
                Paste responsibilities & requirements
              </span>
            </label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the target job description here (e.g. Senior Frontend Engineer role, key qualifications, stack requirements)..."
              className="h-44 text-sm font-sans resize-y focus-visible:ring-indigo-500"
              disabled={isLoading}
            />
          </div>

          {/* Option: Save as New vs Overwrite */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-background/50 hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2.5">
              <Copy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Save as new version</p>
                <p className="text-xs text-muted-foreground">
                  Creates &ldquo;[Tailored] {activeResume?.title}&rdquo; so you preserve the original
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="saveAsNew"
              checked={saveAsNew}
              onChange={(e) => setSaveAsNew(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onClose(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTailor}
            disabled={isLoading || !jobDescription.trim()}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-medium shadow-md shadow-purple-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tailoring Achievements...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Tailor with Gemini 2.5 Flash
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
