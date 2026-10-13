"use client";

import { useState, useRef } from "react";
import ResumeBuilder from "./resume-builder";

export default function ResumeClient({ initialResumes = [], initialActiveResume }) {
  const [resumes, setResumes] = useState(initialResumes);
  const [activeResumeId, setActiveResumeId] = useState(
    initialActiveResume?.id || initialResumes[0]?.id || null
  );
  const builderRef = useRef(null);

  const activeResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0] || null;

  return (
    <div className="w-full space-y-4">
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
