import {
  BookOpen,
  Code2,
  FileCheck,
  LineChart,
  ScrollText,
  Share2,
} from "lucide-react";

export const features = [
  {
    icon: <Code2 className="w-8 h-8 text-primary" />,
    badge: "Monaco Sandbox",
    title: "Technical Coding Interview Sandbox",
    description:
      "Solve algorithmic challenges in JavaScript, TypeScript, Python, and more with dark-mode Monaco editor, test assertion checks, and Big-O audits.",
  },
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    badge: "Adaptive Quiz",
    title: "Domain Knowledge Assessments",
    description:
      "Test domain mastery with industry-calibrated technical assessments, instant explanations, personalized improvement tips, and performance tracking.",
  },
  {
    icon: <FileCheck className="w-8 h-8 text-primary" />,
    badge: "Cover Letters",
    title: "Tailored AI Cover Letter Builder",
    description:
      "Generate high-impact, role-specific cover letters aligned with exact job descriptions and industry requirements in seconds.",
  },
  {
    icon: <LineChart className="w-8 h-8 text-primary" />,
    badge: "Market Intel",
    title: "Real-Time Industry Intelligence",
    description:
      "Access up-to-date salary percentiles, role growth trajectories, top in-demand skills, and market outlooks tailored to your exact discipline.",
  },
  {
    icon: <ScrollText className="w-8 h-8 text-primary" />,
    badge: "ATS Scanner",
    title: "Smart Resume Builder & PDF Exporter",
    description:
      "Craft ATS-friendly, role-tailored resumes with AI-generated experience bullet points, live markdown editor, and one-click PDF downloads.",
  },
  {
    icon: <Share2 className="w-8 h-8 text-primary" />,
    badge: "Networking AI",
    title: "LinkedIn & Cold Outreach Generator",
    description:
      "Generate magnetic LinkedIn headlines, narrative About bios, and high-conversion personalized InMail pitches that recruiters actually open.",
  },
];
