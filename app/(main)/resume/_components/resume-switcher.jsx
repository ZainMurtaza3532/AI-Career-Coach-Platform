"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ChevronDown,
  Copy,
  Edit2,
  FileText,
  Loader2,
  Plus,
  Printer,
  Sparkles,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  duplicateResume,
  renameResume,
  deleteResume,
  createResume,
} from "@/actions/resume";
import TailorDialog from "./tailor-dialog";

export default function ResumeSwitcher({
  resumes = [],
  activeResume,
  onSelectResume,
  onResumesChange,
  onPrint,
  onExportPdf,
  isGeneratingPdf = false,
}) {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isTailorOpen, setIsTailorOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Duplicate current resume
  const handleDuplicate = async () => {
    if (!activeResume?.id) return;
    setIsActionLoading(true);
    try {
      const duplicated = await duplicateResume(activeResume.id);
      toast.success(`Duplicated "${activeResume.title}"`);
      if (onResumesChange) {
        await onResumesChange(duplicated.id);
      }
    } catch (error) {
      console.error("Duplicate error:", error);
      toast.error(error.message || "Failed to duplicate resume");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open rename modal
  const openRenameModal = () => {
    setRenameTitle(activeResume?.title || "");
    setIsRenameOpen(true);
  };

  // Submit rename
  const handleRename = async () => {
    if (!renameTitle.trim() || !activeResume?.id) return;
    setIsActionLoading(true);
    try {
      const updated = await renameResume(activeResume.id, renameTitle.trim());
      toast.success("Resume renamed successfully");
      setIsRenameOpen(false);
      if (onResumesChange) {
        await onResumesChange(updated.id);
      }
    } catch (error) {
      console.error("Rename error:", error);
      toast.error(error.message || "Failed to rename resume");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Create brand new blank resume
  const handleCreateNew = async () => {
    setIsActionLoading(true);
    try {
      const newResume = await createResume(`Resume v${resumes.length + 1}`);
      toast.success("Created new resume version");
      if (onResumesChange) {
        await onResumesChange(newResume.id);
      }
    } catch (error) {
      console.error("Create error:", error);
      toast.error(error.message || "Failed to create new resume");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete resume
  const handleDelete = async () => {
    if (!activeResume?.id) return;
    if (resumes.length <= 1) {
      toast.error("You cannot delete your only resume version.");
      return;
    }
    setIsActionLoading(true);
    try {
      await deleteResume(activeResume.id);
      toast.success("Resume version deleted");
      setIsDeleteOpen(false);
      const remaining = resumes.filter((r) => r.id !== activeResume.id);
      if (onResumesChange) {
        await onResumesChange(remaining[0]?.id);
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete resume");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTailoredSuccess = async (tailoredResume) => {
    if (onResumesChange) {
      await onResumesChange(tailoredResume.id);
    }
  };

  return (
    <div className="no-print w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm mb-6">
      {/* Left: Active Version Badge & Switcher Dropdown */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <FileText className="h-4 w-4 text-primary" />
          <span>Active Version</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-3.5 bg-background/80 hover:bg-accent border-border/80 flex items-center gap-2.5 max-w-[280px] sm:max-w-[340px] truncate justify-between group shadow-xs"
              disabled={isActionLoading}
            >
              <div className="flex items-center gap-2 truncate">
                {activeResume?.title?.startsWith("[Tailored]") ? (
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                ) : (
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                )}
                <span className="truncate font-medium text-sm">
                  {activeResume?.title || "Select Resume"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-72 bg-popover/95 backdrop-blur-lg border-border shadow-xl z-50 p-1.5"
          >
            <div className="flex items-center justify-between px-2 py-1.5">
              <DropdownMenuLabel className="text-xs uppercase text-muted-foreground font-semibold tracking-wider p-0">
                Resume Versions ({resumes.length})
              </DropdownMenuLabel>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                Multi-Version
              </Badge>
            </div>
            <DropdownMenuSeparator />

            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {resumes.map((resume) => {
                const isSelected = resume.id === activeResume?.id;
                const isTailored = resume.title?.startsWith("[Tailored]");
                return (
                  <DropdownMenuItem
                    key={resume.id}
                    onClick={() => onSelectResume && onSelectResume(resume.id)}
                    className="flex items-center justify-between px-2.5 py-2 cursor-pointer rounded-md hover:bg-accent text-sm"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isTailored ? (
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span
                        className={`truncate ${
                          isSelected ? "font-semibold text-primary" : "text-foreground"
                        }`}
                      >
                        {resume.title}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCreateNew}
              className="flex items-center gap-2 text-primary font-medium cursor-pointer px-2.5 py-2 rounded-md hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Version</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Action buttons for active version */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={openRenameModal}
            disabled={isActionLoading || !activeResume}
            title="Rename active version"
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline text-xs">Rename</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicate}
            disabled={isActionLoading || !activeResume}
            title="Duplicate version"
            className="h-9 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline text-xs">Duplicate</span>
          </Button>

          {resumes.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(true)}
              disabled={isActionLoading || !activeResume}
              title="Delete version"
              className="h-9 px-2 text-red-400 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Right: Action Buttons, Tailor, Print & Export */}
      <div className="flex flex-wrap items-center gap-2">

        <Button
          onClick={() => setIsTailorOpen(true)}
          disabled={!activeResume || isActionLoading}
          className="h-9 px-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-medium shadow-sm shadow-indigo-500/20 text-xs sm:text-sm flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          <span>Tailor for Job</span>
        </Button>

        {/* Client Print Stylesheet Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          title="Print or Save as PDF via native print stylesheet"
          className="h-9 px-3 border-border/80 hover:bg-accent text-xs flex items-center gap-1.5"
        >
          <Printer className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline">Print / PDF</span>
          <span className="sm:hidden">Print</span>
        </Button>

        {/* Direct Instant PDF Download */}
        {onExportPdf && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onExportPdf}
            disabled={isGeneratingPdf}
            title="Instant PDF download"
            className="h-9 px-3 text-xs flex items-center gap-1.5"
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="hidden sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </>
            )}
          </Button>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Rename Resume Version</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Give this resume version a descriptive name (e.g., &ldquo;Target: Full Stack&rdquo;).
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              placeholder="Resume Title"
              className="w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRename();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRenameOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isActionLoading || !renameTitle.trim()}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-destructive">
              Delete Resume Version
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete &ldquo;{activeResume?.title}&rdquo;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Delete Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tailor Dialog */}
      <TailorDialog
        isOpen={isTailorOpen}
        onClose={() => setIsTailorOpen(false)}
        activeResume={activeResume}
        onTailoredSuccess={handleTailoredSuccess}
      />
    </div>
  );
}
