import {
  PhoneCall,
  Code2,
  Mic,
  LineChart,
  ScrollText,
  Share2,
} from "lucide-react";

export const features = [
  {
    icon: <PhoneCall className="w-8 h-8 text-primary" />,
    badge: "Voice AI",
    title: "Live Phone Screen Interview Agent",
    description:
      "Engage in realistic two-way conversational phone screens with dynamic AI interviewers, active probing, and instant hiring bar verdicts.",
  },
  {
    icon: <Code2 className="w-8 h-8 text-primary" />,
    badge: "Monaco Sandbox",
    title: "Technical Coding Interview Sandbox",
    description:
      "Solve algorithmic challenges in JavaScript, TypeScript, Python, and more with dark-mode Monaco editor, test assertion checks, and Big-O audits.",
  },
  {
    icon: <Mic className="w-8 h-8 text-primary" />,
    badge: "Speech Analysis",
    title: "Voice Behavioral Mock Simulator",
    description:
      "Practice STAR-method responses with speech-to-text transcription, filler word tracking, pacing analytics, and model answers.",
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
