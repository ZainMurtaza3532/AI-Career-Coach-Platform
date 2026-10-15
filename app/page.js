import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Star } from "lucide-react";
import HeroSection from "@/components/hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { features } from "@/data/features";
import { testimonial } from "@/data/testimonial";
import { faqs } from "@/data/faqs";
import { howItWorks } from "@/data/howItWorks";

export const metadata = {
  title: "Sensai | AI Career Coach & Technical Developer Platform",
  description:
    "Accelerate your career with real-time AI phone screen interview agents, in-browser Monaco coding sandbox, ATS resume builder, and live compensation insights.",
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://sensai-career.vercel.app/#website",
        url: "https://sensai-career.vercel.app",
        name: "Sensai",
        description: "AI Career Coach & Technical Developer Platform",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://sensai-career.vercel.app/#software",
        name: "Sensai AI Career Coach",
        applicationCategory: "EducationalApplication",
        operatingSystem: "All",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          reviewCount: "1250",
        },
      },
      {
        "@type": "FAQPage",
        "@id": "https://sensai-career.vercel.app/#faq",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="grid-background" />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="w-full py-16 md:py-24 bg-background/50 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs uppercase tracking-wider font-mono">
              Core Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-title tracking-tight">
              Everything You Need to Land Tier-1 Offers
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              From live voice phone screens to algorithmic Big-O audits and ATS resume generation, Sensai empowers your entire career pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border border-border/70 hover:border-primary/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                      {feature.icon}
                    </div>
                    {feature.badge && (
                      <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                        {feature.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats & Impact Metrics Section */}
      <section className="w-full py-16 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm space-y-1">
              <h3 className="text-3xl sm:text-5xl font-extrabold gradient-title tracking-tight">
                98%
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-foreground pt-1">
                Interview Readiness
              </p>
              <p className="text-[11px] text-muted-foreground">
                Average STAR mastery gain
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm space-y-1">
              <h3 className="text-3xl sm:text-5xl font-extrabold gradient-title tracking-tight">
                50+
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-foreground pt-1">
                Target Disciplines
              </p>
              <p className="text-[11px] text-muted-foreground">
                Software, Finance, HR & more
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm space-y-1">
              <h3 className="text-3xl sm:text-5xl font-extrabold gradient-title tracking-tight">
                10,000+
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-foreground pt-1">
                Challenges Solved
              </p>
              <p className="text-[11px] text-muted-foreground">
                Algorithms & scenario cases
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card/40 border border-border/60 backdrop-blur-sm space-y-1">
              <h3 className="text-3xl sm:text-5xl font-extrabold gradient-title tracking-tight">
                &lt; 1.8s
              </h3>
              <p className="text-xs sm:text-sm font-semibold text-foreground pt-1">
                Voice Response Time
              </p>
              <p className="text-[11px] text-muted-foreground">
                Real-time conversational agent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs uppercase tracking-wider font-mono">
              Simple 4-Step Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-title tracking-tight">
              How Sensai Accelerates Your Journey
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              A frictionless blueprint from profile onboarding to signed compensation offer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative p-6 rounded-2xl border border-border/70 bg-card/50 backdrop-blur-sm hover:border-primary/40 transition-all flex flex-col items-center text-center space-y-3"
              >
                <div className="absolute top-4 right-4 text-xs font-mono font-bold text-muted-foreground/50">
                  0{index + 1}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
                  {item.icon}
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-16 md:py-24 bg-muted/20 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs uppercase tracking-wider font-mono">
              Candidate Feedback
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-title tracking-tight">
              Trusted by Top Engineers & Leaders
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              See how candidates use Sensai to pass rigorous interview loops and double their compensation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonial.map((item, index) => (
              <Card
                key={index}
                className="bg-card/70 border-border/70 hover:border-primary/40 backdrop-blur-sm transition-all shadow-sm"
              >
                <CardContent className="p-6 space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-foreground/90 italic leading-relaxed">
                    &quot;{item.quote}&quot;
                  </p>

                  <div className="flex items-center space-x-3 pt-2 border-t border-border/50">
                    <div className="relative h-10 w-10 shrink-0">
                      <Image
                        width={40}
                        height={40}
                        src={item.image}
                        alt={item.author}
                        className="rounded-full object-cover border border-primary/30"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-foreground truncate">
                        {item.author}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.role} • <span className="text-primary">{item.company}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs uppercase tracking-wider font-mono">
              FAQ
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold gradient-title tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm">
              Everything you need to know about Sensai&apos;s AI interview models and features.
            </p>
          </div>

          <div className="border border-border/70 rounded-2xl p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b border-border/50 last:border-b-0 px-2"
                >
                  <AccordionTrigger className="text-left font-semibold text-sm sm:text-base hover:text-primary transition-colors py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="w-full py-16 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-card via-primary/10 to-card border border-primary/30 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="space-y-3 max-w-2xl mx-auto">
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 text-xs uppercase tracking-wider font-mono">
                Get Started in 60 Seconds
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-title tracking-tight">
                Ready to Accelerate Your Career?
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                Join thousands of candidates landing top-tier offers with AI-assisted interview screening, coding sandboxes, and tailored resumes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto px-8 h-12 gap-2 font-semibold shadow-lg shadow-primary/25 text-sm sm:text-base">
                  Start Your Journey Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
