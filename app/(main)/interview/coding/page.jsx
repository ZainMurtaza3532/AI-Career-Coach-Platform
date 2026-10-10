import { getCodingAssessments } from "@/actions/coding";
import { redirect } from "next/navigation";
import { checkUser } from "@/lib/checkUser";
import { getIndustryCapabilities } from "@/lib/industryCapabilities";
import CodingHub from "./_components/coding-hub";

export const metadata = {
  title: "Technical Coding Interview Sandbox | Sensai",
  description: "Interactive in-browser technical coding interview sandbox with Monaco editor, asymptotic Big-O audits, and AI pair hint co-pilot.",
};

export default async function CodingInterviewPage() {
  const user = await checkUser();
  const capabilities = getIndustryCapabilities(user?.industry);

  // Security & Role-Gating: Only allow technical / software engineering profiles
  if (!capabilities.hasCodingSandbox) {
    redirect("/interview?restricted=coding-sandbox");
  }

  let assessments = [];
  try {
    assessments = (await getCodingAssessments()) || [];
  } catch (err) {
    console.error("Error loading coding assessments on page:", err);
  }

  return <CodingHub initialAssessments={assessments} userProfile={user} />;
}
