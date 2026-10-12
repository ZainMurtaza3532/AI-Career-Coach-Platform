"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ResumeBuilder from "./resume-builder";
import ResumeSwitcher from "./resume-switcher";
import { getResumes } from "@/actions/resume";

export default function ResumeClient({ initialResumes = [], initialActiveResume }) {
  const router = useRouter();
  const [resumes, setResumes] = useState(initialResumes);
  const [activeResumeId, setActiveResumeId] = useState(
    initialActiveResume?.id || initialResumes[0]?.id || null
  );
  const builderRef = useRef(null);

  const activeResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0] || null;

  const handleSelectResume = (id) => {
    setActiveResumeId(id);
    router.push(`/resume?id=${id}`);
  };

  const handleResumesChange = async (selectedId) => {
    try {
      const refreshed = await getResumes();
      setResumes(refreshed);
      if (selectedId) {
        setActiveResumeId(selectedId);
      } else if (!refreshed.some((r) => r.id === activeResumeId)) {
        setActiveResumeId(refreshed[0]?.id || null);
      }
    } catch (err) {
      console.error("Failed to refresh resumes:", err);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Multi-Version Switcher & ATS Score Toolbar */}
      <ResumeSwitcher
        resumes={resumes}
        activeResume={activeResume}
        onSelectResume={handleSelectResume}
        onResumesChange={handleResumesChange}
        onPrint={() => builderRef.current?.print()}
        onExportPdf={() => builderRef.current?.generatePDF()}
        isGeneratingPdf={builderRef.current?.isGenerating}
      />

      {/* Main Resume Builder with Live ATS Compatibility Card */}
      <ResumeBuilder
        key={activeResume?.id}
        ref={builderRef}
        activeResume={activeResume}
        initialContent={activeResume?.content || ""}
        onSaveSuccess={(savedResume) => {
          setResumes((prev) =>
            prev.map((r) => (r.id === savedResume.id ? savedResume : r))
          );
        }}
      />
    </div>
  );
}
