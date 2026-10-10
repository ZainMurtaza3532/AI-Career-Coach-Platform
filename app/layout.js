import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";

import {
  ConditionalHeader,
  ConditionalFooter,
} from "@/components/conditional-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sensai - AI Career Coach & Developer Platform",
  description: "Comprehensive AI career coach platform with intelligent resume building, voice behavioral mock interviews, live phone screen agents, and technical coding sandboxes.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <ConditionalHeader>
              <Header />
            </ConditionalHeader>
            <main className="min-h-screen">{children}</main>
            <Toaster richColors />

            <ConditionalFooter />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
