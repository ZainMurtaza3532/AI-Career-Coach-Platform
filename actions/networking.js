"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { callGemini as callGeminiWithFallback } from "@/lib/gemini";

/**
 * Generate optimized LinkedIn Headlines, About Summary, and Skills
 * based on the user's career profile and selected tone.
 */
export async function generateLinkedInProfile(tone = "Technical Leader") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      name: true,
      industry: true,
      experience: true,
      bio: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const userContext = `
    Name: ${user.name || "Professional"}
    Industry/Specialization: ${user.industry || "Technology"}
    Years of Experience: ${user.experience || "Mid-to-Senior level"}
    Current Bio/Background: ${user.bio || "Experienced practitioner focused on building scalable, impactful solutions."}
    Skills: ${user.skills?.length ? user.skills.join(", ") : "Problem Solving, Strategic Leadership, Full Lifecycle Delivery"}
  `;

  const prompt = `
    You are an elite executive career branding strategist and LinkedIn optimization expert.
    Create a high-performing LinkedIn profile overhaul based on the following candidate profile:

    ${userContext}

    Selected Tone: "${tone}" (e.g. "Direct & Impactful", "Story-driven & Human", "Technical Leader", "Executive & Visionary").

    Guidelines:
    1. Headlines: Provide 3 distinct, high-impact headlines (under 220 characters each). Incorporate value proposition, domain expertise, and measurable impact without cliché buzzwords.
    2. About Summary: Write a compelling 1,500 - 2,000 character narrative. 
       - Hook the reader in the first 2 lines.
       - Outline core philosophy and career trajectory.
       - Highlight key achievements and technical/business competencies.
       - Conclude with a clear call to connect.
       - Format with clean spacing, bullet points, and high readability.
    3. Featured Skills: Pick 8-12 high-search-volume keywords and technical competencies tailored to recruiter searches.

    AVOID generic AI clichés like "delve", "testament", "tapestry", "beacon", "synergy". Write like an authentic, highly accomplished human leader.

    Return ONLY a valid JSON object in the following format with NO additional markdown code fences:
    {
      "headlines": [
        "Headline option 1",
        "Headline option 2",
        "Headline option 3"
      ],
      "about": "Full markdown-formatted About section text...",
      "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"]
    }
  `;

  try {
    const text = await callGeminiWithFallback(prompt);
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);

    return parsed;
  } catch (error) {
    console.error("Error generating LinkedIn profile:", error);
    throw new Error("Failed to generate LinkedIn profile");
  }
}

/**
 * Generate high-conversion, non-spammy InMail & cold networking messages.
 */
export async function generateColdMessage({
  targetRole,
  companyName,
  recipientTitle,
  intent,
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      name: true,
      industry: true,
      experience: true,
      bio: true,
      skills: true,
    },
  });

  if (!user) throw new Error("User not found");

  const senderContext = `
    Sender Name: ${user.name || "A candidate"}
    Industry: ${user.industry || "Technology"}
    Years Experience: ${user.experience || "Several years"}
    Key Skills: ${user.skills?.length ? user.skills.slice(0, 5).join(", ") : "Software Engineering, Architecture"}
    Bio: ${user.bio || "Passionate engineer and problem solver"}
  `;

  const prompt = `
    You are an elite career networking coach and recruiter communication expert.
    Write high-conversion, respectful, and authentic cold outreach messages based on the details below:

    Sender Profile:
    ${senderContext}

    Outreach Details:
    - Target Role: "${targetRole}"
    - Target Company: "${companyName}"
    - Recipient Title: "${recipientTitle}" (e.g. Engineering Manager, Recruiter, Founder)
    - Networking Intent: "${intent}" (e.g. "Job Referral", "Informational Interview", "Hiring Manager Pitch", "Casual Connection")

    Rules for Success:
    1. Hook: Start with genuine relevance or shared context, not "I hope this email finds you well".
    2. Value proposition: Brief statement of why the sender is uniquely qualified or interested in ${companyName}.
    3. Low-friction Call-to-Action (CTA): Don't demand a 30-minute call immediately; ask a brief, easy-to-answer question or for permission to share a resume.
    4. Provide two variants:
       - "shortMessage": Under 100 words (ideal for LinkedIn connection requests or short InMail).
       - "fullMessage": Under 200 words (ideal for direct email or full InMail).
    5. Provide 3 subject line options (punchy, high open-rate, under 50 characters).

    Return ONLY a valid JSON object in the following format with NO additional text:
    {
      "subjectLines": [
        "Subject 1",
        "Subject 2",
        "Subject 3"
      ],
      "shortMessage": "Under 100 words text...",
      "fullMessage": "Under 200 words text...",
      "proTip": "A 1-2 sentence tactical networking tip for following up effectively."
    }
  `;

  try {
    const text = await callGeminiWithFallback(prompt);
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText);

    return parsed;
  } catch (error) {
    console.error("Error generating cold message:", error);
    throw new Error("Failed to generate cold message");
  }
}
