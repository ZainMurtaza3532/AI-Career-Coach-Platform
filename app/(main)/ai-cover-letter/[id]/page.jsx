import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCoverLetter } from "@/actions/cover-letter";
import CoverLetterPreview from "../_components/cover-letter-preview";

export default async function EditCoverLetterPage({ params }) {
  const { id } = await params;
  const coverLetter = await getCoverLetter(id);

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
            {coverLetter?.jobTitle} at {coverLetter?.companyName}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Generated tailored cover letter preview and export.
          </p>
        </div>
      </div>

      <CoverLetterPreview content={coverLetter?.content} />
    </div>
  );
}
