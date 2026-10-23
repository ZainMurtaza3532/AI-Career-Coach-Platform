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

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sensai-career.vercel.app";

export const viewport = {
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sensai | AI Career Coach & Developer Platform",
    template: "%s | Sensai",
  },
  description:
    "Comprehensive AI career coach platform with intelligent resume building, domain interview assessments, and technical coding sandboxes.",
  keywords: [
    "AI career coach",
    "technical interview preparation",
    "mock interview AI",
    "ATS resume builder",
    "coding sandbox",
    "AI cover letter generator",
    "career growth platform",
  ],
  authors: [{ name: "Sensai" }],
  creator: "Sensai",
  publisher: "Sensai",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Sensai | AI Career Coach & Developer Platform",
    description:
      "Accelerate your career with an in-browser Monaco coding sandbox, ATS resume builder, domain interview assessments, and live compensation insights.",
    siteName: "Sensai",
    images: [
      {
        url: "/banner.jpeg",
        width: 1280,
        height: 720,
        alt: "Sensai AI Career Coach Platform Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sensai | AI Career Coach & Developer Platform",
    description:
      "Accelerate your career with an in-browser Monaco coding sandbox, ATS resume builder, domain interview assessments, and live compensation insights.",
    images: ["/banner.jpeg"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
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
          <link rel="preconnect" href="https://randomuser.me" />
          <link rel="dns-prefetch" href="https://randomuser.me" />
        </head>
        <body className={`${inter.className} ${inter.variable} font-sans antialiased`}>
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
