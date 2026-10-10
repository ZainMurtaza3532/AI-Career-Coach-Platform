"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { callGemini, callGeminiJSON } from "@/lib/gemini";
import { revalidatePath } from "next/cache";

const PERSONA_PROMPTS = {
  "FAANG Engineering Lead": `
    You are an elite Staff Engineering Lead at a Tier-1 FAANG company conducting a high-stakes technical phone screen.
    Style: Rigorous, highly observant, deeply analytical, and direct.
    Tone: Professional, piercing, zero tolerance for hand-waving or superficial buzzwords.
    Behavior:
    - Keep responses concise (2 to 4 spoken sentences max), mimicking an interactive phone conversation.
    - If the candidate mentions an architecture, technology, or metric without depth, IMMEDIATELY probe deeper into failure modes, trade-offs, consistency models, or exact quantitative impact.
    - Do not lecture. Acknowledge briefly and ask the next sharp follow-up.
  `,
  "Empathetic HR Manager": `
    You are an experienced, perceptive Senior Talent Partner & HR Manager conducting a culture-fit and behavioral phone screen.
    Style: Warm, encouraging, empathetic, yet sharply evaluative of emotional intelligence and team dynamics.
    Tone: Conversational, supportive, highly professional.
    Behavior:
    - Keep responses concise (2 to 4 spoken sentences max).
    - Focus on conflict resolution, stakeholder empathy, cross-functional collaboration, ownership, and learning from failure.
    - Ask follow-ups that challenge the candidate to reflect honestly on their interpersonal impact.
  `,
  "Startup CTO": `
    You are a fast-moving, pragmatic Startup CTO / Founder conducting a screening call for a critical engineering hire.
    Style: Fast-paced, outcome-oriented, pragmatic, and resourceful.
    Tone: Casual yet sharp, prioritizing execution speed, 80/20 trade-offs, and extreme ownership.
    Behavior:
    - Keep responses punchy (2 to 3 spoken sentences max).
    - Probe for scrappiness: How do they handle incomplete requirements, tight runway, and shipping value over theoretical perfection?
    - React naturally with quick conversational follow-ups.
  `,
};

/**
 * Generates the next live conversational turn from the AI Interviewer
 */
export async function converseLiveAgent({
  conversation = [],
  userMessage = "",
  persona = "FAANG Engineering Lead",
  targetRole = "Senior Software Engineer",
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const personaInstruction =
    PERSONA_PROMPTS[persona] || PERSONA_PROMPTS["FAANG Engineering Lead"];

  const formattedHistory = conversation
    .slice(-6)
    .map(
      (m) =>
        `${m.role === "interviewer" ? "INTERVIEWER" : "CANDIDATE"}: "${m.text}"`
    )
    .join("\n");

  const prompt = `
${personaInstruction}

TARGET ROLE: ${targetRole}

CONVERSATION SO FAR:
${formattedHistory || "No previous turns. This is the very start of the phone interview."}

LATEST CANDIDATE UTTERANCE:
"${userMessage || "Hello, I am ready to begin the interview."}"

TASK:
Respond as the interviewer. Keep it conversational, spoken-audio friendly, and punchy (maximum 2-3 sentences).
If this is the beginning, introduce yourself briefly and fire your opening question for the ${targetRole} position.
If the candidate spoke, evaluate their answer on the fly and ask a direct, probing follow-up.

Return ONLY a valid JSON object in this format:
{
  "replyText": "<The exact natural words you speak to the candidate>",
  "isInterruption": false,
  "probingFocus": "<Brief note on what you are probing: e.g. Scalability metrics / Conflict resolution>"
}
`;

  try {
    const data = await callGeminiJSON(prompt);
    return {
      success: true,
      data: {
        replyText: data.replyText || "Could you elaborate on the architectural trade-offs you made in that scenario?",
        isInterruption: !!data.isInterruption,
        probingFocus: data.probingFocus || "Technical Competency",
      },
    };
  } catch (error) {
    console.error("Converse live agent error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate interviewer reply",
      data: {
        replyText: "That's an interesting point. Could you dive deeper into the specific trade-offs and metrics you monitored during that implementation?",
        isInterruption: false,
        probingFocus: "Deep Dive",
      },
    };
  }
}

/**
 * Evaluates the completed phone interview session and saves to Prisma
 */
export async function evaluateLiveInterviewSession({
  conversation = [],
  persona = "FAANG Engineering Lead",
  targetRole = "Senior Software Engineer",
  durationSeconds = 180,
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true, name: true, industry: true },
  });

  if (!user) throw new Error("User not found");

  if (!conversation || conversation.length < 2) {
    throw new Error("Conversation must contain at least 2 conversational turns to evaluate.");
  }

  const transcript = conversation
    .map(
      (m) =>
        `[${m.role.toUpperCase()}]: ${m.text}`
    )
    .join("\n\n");

  const prompt = `
You are an executive talent evaluator and hiring committee bar-raiser reviewing a completed live audio phone screen.
Interviewer Persona: "${persona}"
Target Role: "${targetRole}"
Session Duration: ${durationSeconds} seconds

FULL SESSION TRANSCRIPT:
${transcript}

Analyze the candidate's spoken responses across technical competency, communication velocity, structure (STAR / First Principles), and confidence markers.
Return ONLY a valid JSON object strictly matching this schema:
{
  "overallScore": <1-10 float, e.g. 7.8>,
  "metrics": {
    "technicalAccuracy": <1-10 float>,
    "clarity": <1-10 float>,
    "pacingWpm": <estimated average words per minute, e.g. 135>,
    "confidence": <1-10 float>
  },
  "hiringRecommendation": "<Strong Hire | Hire | Leaning No | No Hire>",
  "summaryFeedback": "<2-3 paragraph executive summary evaluating the candidate's performance, poise under pressure, and conversational depth>",
  "strengths": ["<Specific strength 1>", "<Specific strength 2>", "<Specific strength 3>"],
  "improvements": ["<Actionable growth area 1>", "<Actionable growth area 2>", "<Actionable growth area 3>"]
}
`;

  try {
    const evaluation = await callGeminiJSON(prompt);

    const savedSession = await db.liveInterviewSession.create({
      data: {
        userId: user.id,
        persona,
        targetRole,
        durationSeconds,
        overallScore: Number(evaluation.overallScore || 7.0),
        metrics: evaluation.metrics || {
          technicalAccuracy: 7.0,
          clarity: 7.5,
          pacingWpm: 130,
          confidence: 7.0,
        },
        conversation,
        summaryFeedback: evaluation.summaryFeedback || "Candidate demonstrated solid domain fundamentals.",
        strengths: evaluation.strengths || ["Clear communication", "Structured thinking"],
        improvements: evaluation.improvements || ["Quantify metrics more explicitly"],
      },
    });

    revalidatePath("/interview");
    revalidatePath("/interview/live-agent");

    return {
      success: true,
      data: savedSession,
    };
  } catch (error) {
    console.error("Evaluation error:", error);
    throw new Error(error.message || "Failed to evaluate session");
  }
}

/**
 * Retrieves past Live Interview sessions for the user
 */
export async function getLiveInterviewSessions() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  });

  if (!user) return [];

  try {
    return await db.liveInterviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch (err) {
    console.error("Error getting live interview sessions:", err);
    return [];
  }
}
