import { getResumes } from "@/actions/resume";
import ResumeClient from "./_components/resume-client";

export default async function ResumePage({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  const resumes = await getResumes();
  const activeResume =
    resumes.find((r) => r.id === resolvedParams.id) || resumes[0];

  return (
    <div className="space-y-6">
      <ResumeClient
        initialResumes={resumes}
        initialActiveResume={activeResume}
      />
    </div>
  );
}
