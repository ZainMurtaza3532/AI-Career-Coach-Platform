import { getCoverLetters } from "@/actions/cover-letter";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import CoverLetterList from "./_components/cover-letter-list";

export const metadata = {
  title: "AI Cover Letter Generator & Manager",
  description:
    "Generate and manage tailored, role-specific cover letters that catch hiring managers' attention.",
};

export default async function CoverLetterPage() {
  const coverLetters = await getCoverLetters();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-title">
            My Cover Letters
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Manage and generate tailored cover letters for your job applications.
          </p>
        </div>
        <Link href="/ai-cover-letter/new">
          <Button className="w-fit">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      <CoverLetterList coverLetters={coverLetters} />
    </div>
  );
}
