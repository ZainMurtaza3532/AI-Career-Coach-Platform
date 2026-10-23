"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { callGemini, callGeminiJSON } from "@/lib/gemini";
import {
  getIndustryCapabilities,
  getDomainFallbackQuestions,
} from "@/lib/industryCapabilities";
import { getAuthenticatedDbUser } from "@/lib/checkUser";

export async function generateQuiz() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getAuthenticatedDbUser(userId);

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

  const user = await getAuthenticatedDbUser(userId);

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

  const user = await getAuthenticatedDbUser(userId);

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
export async function evaluateCodeSubmission(params) {
  const { evaluateCodeSubmission: evalFn } = await import("./coding");
  return evalFn(params);
}

