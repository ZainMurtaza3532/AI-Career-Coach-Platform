import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Create Your Account",
  description:
    "Join Sensai and fast-track your career with AI domain assessments, ATS resume optimization, and Monaco coding sandboxes.",
};

export default function Page() {
  return <SignUp />;
}
