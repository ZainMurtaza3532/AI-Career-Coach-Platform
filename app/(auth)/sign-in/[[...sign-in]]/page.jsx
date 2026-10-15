import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Sign In",
  description: "Sign in to access your Sensai AI Career Coach workspace.",
};

export default function Page() {
  return <SignIn />;
}
