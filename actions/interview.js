"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { callGemini, callGeminiJSON } from "@/lib/gemini";
import {
  getIndustryCapabilities,
  getDomainFallbackQuestions,
} from "@/lib/industryCapabilities";

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      industry: true,
      skills: true,
      experience: true,
    },
  });

  if (!user) throw new Error("User not found");

  const capabilities = getIndustryCapabilities(
    user.industry || "",
    user.skills?.join(" ") || ""
  );

  let prompt = "";
  if (capabilities.isTechnical) {
    prompt = `
    Generate 10 technical interview questions for a ${
      user.industry || "Technology"
    } professional${
      user.experience ? ` with ${user.experience} years of experience` : ""
    }${
      user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }.
    
    Target focus areas: ${capabilities.focusAreas.join(", ")}.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;
  } else {
    prompt = `
    Generate 10 realistic, scenario-based interview questions for a ${
      user.industry || "Business"
    } professional${
      user.experience ? ` with ${user.experience} years of experience` : ""
    }${
      user.skills?.length ? ` with competencies in ${user.skills.join(", ")}` : ""
    }.
    
    Key evaluation domains: ${capabilities.focusAreas.join(", ")}.
    Target metric / focus: ${capabilities.domainTerm}.
    
    CRITICAL CONSTRAINT: This user is in a NON-TECHNICAL / NON-CODING industry (${user.industry || "business"}).
    - Absolutely DO NOT generate any computer programming code, SQL queries, algorithm trivia, data structure mechanics, or software engineering questions.
    - Questions MUST be situational, analytical, practical, or strategic questions relevant to ${user.industry || "the domain"}.
    - Emphasize real-world tradeoffs, decision making, stakeholder communication, and performance metrics.
    
    Each question should be multiple choice with 4 options.
    
    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;
  }

  try {
    const quiz = await callGeminiJSON(prompt);
    const questions = Array.isArray(quiz)
      ? quiz
      : Array.isArray(quiz?.questions)
      ? quiz.questions
      : [];

    if (questions.length > 0) {
      return questions;
    }
    throw new Error("No questions returned");
  } catch (error) {
    console.error("Error generating quiz, using domain fallback:", error);
    return getDomainFallbackQuestions(capabilities.domainKey, user.industry || "");
  }
}

export async function generateInterviewQuiz() {
  return generateQuiz();
}

export async function saveQuizResult(questions, answers, score) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Get wrong answers
  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      improvementTip = (await callGemini(improvementPrompt)).trim();
      console.log(improvementTip);
    } catch (error) {
      console.error("Error generating improvement tip:", error);
      // Continue without improvement tip if generation fails
    }
  }

  try {
    const assessment = await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const assessments = await db.assessment.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    throw new Error("Failed to fetch assessments");
  }
}

export async function generateBehavioralQuestions(targetRole) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    select: { industry: true, skills: true },
  });

  const roleOrIndustry = targetRole || user?.industry || "Software & Technology";

  const prompt = `
    Generate 5 distinct, high-impact behavioral interview questions for a ${roleOrIndustry} professional.
    The questions must address:
    1. Stakeholder conflict or disagreement resolution
    2. Major project/technical failure, mistake, and lessons learned
    3. Delivering high-quality work under tight deadlines or high pressure
    4. Demonstrating initiative, ownership, or leadership without formal authority
    5. Complex collaboration, cross-functional alignment, or difficult decision-making

    Return ONLY a valid JSON object in this format with NO additional text:
    {
      "questions": [
        {
          "id": 1,
          "question": "string",
          "category": "string",
          "tip": "string"
        }
      ]
    }
  `;

  try {
    const parsed = await callGeminiJSON(prompt);
    if (parsed.questions && parsed.questions.length >= 5) {
      return parsed.questions.slice(0, 5);
    }
    return parsed.questions || [];
  } catch (error) {
    console.error("Error generating behavioral questions, using fallback:", error);
    return [
      {
        id: 1,
        question: "Tell me about a time you had a significant disagreement with a stakeholder or team member. How did you handle the situation and achieve alignment?",
        category: "Conflict Resolution",
        tip: "Focus on active listening, empathy, data-driven reasoning, and achieving a win-win outcome.",
      },
      {
        id: 2,
        question: "Describe a project or technical failure you were accountable for. What went wrong, how did you remediate it, and what systems did you implement to prevent recurrence?",
        category: "Accountability & Growth",
        tip: "Own the mistake transparently, explain your root cause analysis, and highlight your long-term preventive improvements.",
      },
      {
        id: 3,
        question: "Tell me about a time you had to deliver a critical project under an aggressive deadline or high-pressure circumstances. How did you manage trade-offs?",
        category: "Execution & Prioritization",
        tip: "Explain your scoping, milestone prioritization, risk mitigation, and team/stakeholder communication.",
      },
      {
        id: 4,
        question: "Describe a situation where you took initiative to solve a problem or lead a project without formal authority.",
        category: "Leadership & Initiative",
        tip: "Demonstrate proactivity, cross-functional influence, and measurable business impact.",
      },
      {
        id: 5,
        question: "Tell me about a time you had to make a high-stakes decision with incomplete data or ambiguous requirements. How did you navigate the uncertainty?",
        category: "Problem Solving",
        tip: "Outline your decision-making framework, assumptions testing, and post-decision monitoring.",
      },
    ];
  }
}

export async function evaluateBehavioralAnswer({ transcript, question, targetRole }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!transcript || transcript.trim().length === 0) {
    throw new Error("Transcript cannot be empty");
  }

  const prompt = `
    You are an executive interview coach and behavioral interviewer specializing in the STAR method (Situation, Task, Action, Result).
    Analyze this candidate's spoken response:

    Target Role: "${targetRole || "Professional"}"
    Interview Question: "${question}"
    Candidate Spoken Transcript: "${transcript.replace(/"/g, '\\"')}"

    Evaluate the response thoroughly and return ONLY a valid JSON object matching this schema with NO extra notes:
    {
      "scores": {
        "situation": <1-10 integer/float>,
        "task": <1-10 integer/float>,
        "action": <1-10 integer/float>,
        "result": <1-10 integer/float>,
        "clarity": <1-10 integer/float>,
        "overall": <1-10 float weighted average>
      },
      "starFeedback": {
        "situation": "<concise feedback on the context/background established>",
        "task": "<concise feedback on the challenge, responsibility, or goal identified>",
        "action": "<concise feedback on specific personal actions, ownership, and competencies demonstrated>",
        "result": "<concise feedback on measurable outcomes, data points, and business impact>"
      },
      "fillerWords": [
        { "word": "string", "count": number }
      ],
      "totalFillerCount": <number>,
      "strengths": ["string", "string"],
      "improvements": ["string", "string"],
      "rewrittenAnswer": "<An exemplary, natural-sounding, high-impact model answer utilizing the candidate's scenario in strict STAR format with strong metrics and zero filler words>"
    }
  `;

  try {
    const parsed = await callGeminiJSON(prompt);
    return parsed;
  } catch (error) {
    console.error("Error evaluating behavioral answer:", error);
    throw new Error("Failed to evaluate behavioral answer: " + error.message);
  }
}

export async function saveBehavioralInterview({
  targetRole,
  questions,
  overallScore,
  starScores,
  feedback,
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    if (!db.behavioralInterview) {
      console.warn("db.behavioralInterview model is not available on client");
      return null;
    }

    const interview = await db.behavioralInterview.create({
      data: {
        userId: user.id,
        targetRole: targetRole || user.industry || "General",
        overallScore,
        starScores,
        questions,
        feedback,
      },
    });

    revalidatePath("/interview");
    revalidatePath("/interview/voice");
    return interview;
  } catch (error) {
    console.error("Error saving behavioral interview:", error);
    throw new Error("Failed to save behavioral interview");
  }
}

export async function getBehavioralInterviews() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    if (!db.behavioralInterview) {
      return [];
    }

    return await db.behavioralInterview.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching behavioral interviews:", error);
    return [];
  }
}

export async function getBehavioralInterviewById(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    if (!db.behavioralInterview) {
      return null;
    }

    return await db.behavioralInterview.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error("Error fetching behavioral interview by id:", error);
    return null;
  }
}

export async function evaluateCodeSubmission(params) {
  const { evaluateCodeSubmission: evalFn } = await import("./coding");
  return evalFn(params);
}
