"use client";

import { useState } from "react";
import ResumeBuilder from "./resume-builder";

export default function ResumeClient({ initialResumes = [], initialActiveResume }) {
  const [resumes, setResumes] = useState(initialResumes);
  const activeResume =
    initialActiveResume || resumes[0] || null;

  return (
    <div className="w-full">
      <ResumeBuilder
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
