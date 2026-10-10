import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-background">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <div className="mb-6">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Sensai Logo"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </div>

      {children}
    </div>
  );
};

export default AuthLayout;
