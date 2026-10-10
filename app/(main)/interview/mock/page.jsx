import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Quiz from "../_components/quiz";

export default function MockInterviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Link href="/interview">
          <Button
            variant="link"
            className="gap-2 pl-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interview Preparation Hub
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-title">
            Mock Interview
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Test your knowledge with industry-specific domain assessment questions.
          </p>
        </div>
      </div>

      <Quiz />
    </div>
  );
}
