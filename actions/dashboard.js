"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { callGeminiJSON } from "@/lib/gemini";
import { unstable_cache, revalidateTag } from "next/cache";

/**
 * AI Industry Trends generation
 * @param {string} industry
 */
export const generateAIInsights = async (industry) => {
  const prompt = `
    Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
    {
      "salaryRanges": [
        { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
      ],
      "growthRate": number,
      "demandLevel": "High" | "Medium" | "Low",
      "topSkills": ["skill1", "skill2"],
      "marketOutlook": "Positive" | "Neutral" | "Negative",
      "keyTrends": ["trend1", "trend2"],
      "recommendedSkills": ["skill1", "skill2"]
    }
    
    IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
    Include at least 5 common roles for salary ranges.
    Growth rate should be a percentage.
    Include at least 5 skills and trends.
  `;

  return await callGeminiJSON(prompt);
};

/**
 * Route Segment & Data-cached industry insights fetcher
 * Revalidates every 24 hours (86400s) to eliminate redundant reads and cold-start latency.
 */
export const getCachedIndustryInsight = unstable_cache(
  async (industry) => {
    return await db.industryInsight.findUnique({
      where: { industry },
      select: {
        id: true,
        industry: true,
        salaryRanges: true,
        growthRate: true,
        demandLevel: true,
        topSkills: true,
        marketOutlook: true,
        keyTrends: true,
        recommendedSkills: true,
        lastUpdated: true,
        nextUpdate: true,
      },
    });
  },
  ["industry-insight-cache"],
  {
    revalidate: 86400, // 24 hours
    tags: ["industry-insights"],
  }
);

/**
 * Fast, cached dashboard insights action
 */
export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Strict projection query: only fetch industry
  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
    },
  });

  if (!user || !user.industry) {
    throw new Error("User or assigned industry not found");
  }

  // 1. Attempt cached lookup
  let insight = await getCachedIndustryInsight(user.industry);

  // 2. Fallback: generate and persist if missing
  if (!insight) {
    const aiData = await generateAIInsights(user.industry);

    insight = await db.industryInsight.upsert({
      where: { industry: user.industry },
      create: {
        industry: user.industry,
        ...aiData,
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      update: {
        ...aiData,
        lastUpdated: new Date(),
        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      select: {
        id: true,
        industry: true,
        salaryRanges: true,
        growthRate: true,
        demandLevel: true,
        topSkills: true,
        marketOutlook: true,
        keyTrends: true,
        recommendedSkills: true,
        lastUpdated: true,
        nextUpdate: true,
      },
    });

    revalidateTag("industry-insights");
  }

  return insight;
}
