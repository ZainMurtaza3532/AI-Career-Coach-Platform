"use client";

import { usePathname } from "next/navigation";

export function ConditionalHeader({ children }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthPage) return null;
  return children;
}

export function ConditionalFooter() {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthPage) return null;

  return (
    <footer className="bg-muted/50 py-12">
      <div className="container mx-auto px-4 text-center text-gray-200">
        <p>Made with 💗 by Zain Murtaza</p>
      </div>
    </footer>
  );
}
