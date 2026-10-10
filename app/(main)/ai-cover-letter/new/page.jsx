import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterGenerator from "../_components/cover-letter-generator";

export default function NewCoverLetterPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <Link href="/ai-cover-letter">
          <Button
            variant="link"
            className="gap-2 pl-0 text-muted-foreground hover:text-foreground text-xs sm:text-sm w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>

        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-title">
            Create Cover Letter
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Generate a tailored, ATS-compliant cover letter for your job application.
          </p>
        </div>
      </div>

      <CoverLetterGenerator />
    </div>
  );
}
