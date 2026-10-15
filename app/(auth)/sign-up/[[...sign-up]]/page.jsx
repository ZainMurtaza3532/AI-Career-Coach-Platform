import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Create Your Account",
  description:
    "Join Sensai and fast-track your career with AI mock interviews, ATS resume optimization, and real-time phone screening agents.",
};

export default function Page() {
  return <SignUp />;
}
