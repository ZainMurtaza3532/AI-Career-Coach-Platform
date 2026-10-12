"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { callGemini } from "@/lib/gemini";
import { getAuthenticatedDbUser } from "@/lib/checkUser";

// Helper to authenticate user
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await getAuthenticatedDbUser(userId);

  if (!user) throw new Error("User not found");
  return user;
}

export async function getResumes() {
  const user = await getAuthenticatedUser();

  let resumes = await db.resume.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (resumes.length === 0) {
    const defaultResume = await db.resume.create({
      data: {
        userId: user.id,
        title: "Default Resume",
        content: "",
      },
    });
    resumes = [defaultResume];
  }

  return resumes;
}

export async function getResume(resumeId) {
  const user = await getAuthenticatedUser();

  if (resumeId) {
    const resume = await db.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });
    if (resume) return resume;
  }

  // Fallback to latest resume
  let resume = await db.resume.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });

  if (!resume) {
    resume = await db.resume.create({
      data: {
        userId: user.id,
        title: "Default Resume",
        content: "",
      },
    });
  }

  return resume;
}

export async function saveResume(content, resumeId, title) {
  const user = await getAuthenticatedUser();

  try {
    let resume;
    if (resumeId) {
      const existing = await db.resume.findFirst({
        where: { id: resumeId, userId: user.id },
      });
      if (!existing) throw new Error("Resume not found");

      resume = await db.resume.update({
        where: { id: resumeId },
        data: {
          content,
          ...(title ? { title } : {}),
        },
      });
    } else {
      const existing = await db.resume.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      if (existing) {
        resume = await db.resume.update({
          where: { id: existing.id },
          data: {
            content,
            ...(title ? { title } : {}),
          },
        });
      } else {
        resume = await db.resume.create({
          data: {
            userId: user.id,
            title: title || "Default Resume",
            content,
          },
        });
      }
    }

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw new Error(error.message || "Failed to save resume");
  }
}

export async function createResume(title = "New Resume") {
  const user = await getAuthenticatedUser();

  try {
    const resume = await db.resume.create({
      data: {
        userId: user.id,
        title: title.trim() || "New Resume",
        content: "",
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error creating resume:", error);
    throw new Error(error.message || "Failed to create resume");
  }
}

export async function duplicateResume(resumeId) {
  const user = await getAuthenticatedUser();

  try {
    const existing = await db.resume.findFirst({
      where: {
        id: resumeId,
        userId: user.id,
      },
    });

    if (!existing) throw new Error("Resume not found");

    const duplicated = await db.resume.create({
      data: {
        userId: user.id,
        title: `${existing.title} (Copy)`,
        content: existing.content,
        atsScore: existing.atsScore,
        feedback: existing.feedback,
        targetRole: existing.targetRole,
        targetJobDescription: existing.targetJobDescription,
      },
    });

    revalidatePath("/resume");
    return duplicated;
  } catch (error) {
    console.error("Error duplicating resume:", error);
    throw new Error(error.message || "Failed to duplicate resume");
  }
}

export async function renameResume(resumeId, title) {
  const user = await getAuthenticatedUser();

  try {
    const existing = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
    if (!existing) throw new Error("Resume not found");

    const updated = await db.resume.update({
      where: { id: resumeId },
      data: {
        title: title.trim() || "Untitled Resume",
      },
    });

    revalidatePath("/resume");
    return updated;
  } catch (error) {
    console.error("Error renaming resume:", error);
    throw new Error(error.message || "Failed to rename resume");
  }
}

export async function deleteResume(resumeId) {
  const user = await getAuthenticatedUser();

  try {
    const count = await db.resume.count({
      where: { userId: user.id },
    });

    if (count <= 1) {
      throw new Error("You must keep at least one resume version.");
    }

    const existing = await db.resume.findFirst({
      where: { id: resumeId, userId: user.id },
    });
    if (!existing) throw new Error("Resume not found");

    await db.resume.delete({
      where: { id: resumeId },
    });

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw new Error(error.message || "Failed to delete resume");
  }
}

export async function tailorResumeToJob(resumeId, targetJobDescription, createCopy = false) {
  const user = await getAuthenticatedUser();

  if (!targetJobDescription || targetJobDescription.trim().length < 20) {
    throw new Error("Please provide a meaningful job description (minimum 20 characters).");
  }

  const resume = await db.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  if (!resume) {
    throw new Error("Target resume not found");
  }

  const prompt = `
You are an elite Executive Career Coach and ATS Resume Optimization Architect using Google Gemini 2.5 Flash.

TASK:
Rewrite and tailor the provided candidate resume to strategically align with the Target Job Description below.

TARGET JOB DESCRIPTION:
"""
${targetJobDescription}
"""

CANDIDATE'S CURRENT RESUME (MARKDOWN):
"""
${resume.content || "No previous content. Generate a complete professional resume outline."}
"""

CANDIDATE INDUSTRY CONTEXT:
Industry: ${user.industry || "General"}

STRICT OPTIMIZATION DIRECTIVES:
1. ACHIEVEMENT BULLETS REWRITING:
   - Rewrite, refine, and elevate all accomplishment bullets in Experience and Projects to showcase high-impact results.
   - Use quantified metrics, percentages, numbers, scale, or efficiency gains where applicable.
   - Structure achievement bullets using the Google X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]" or strong Action Verb + Context + Quantifiable Result.
2. ATS KEYWORD TARGETING:
   - Seamlessly integrate core technical terms, domain skills, and competencies from the Job Description into the summary, skills list, and achievement bullets where the candidate has relevant background.
3. ABSOLUTE TRUTHFULNESS & ZERO FABRICATION (STRICT):
   - DO NOT fabricate employment histories, false company names, unearned degrees, or fake certifications.
   - Keep the candidate's authentic roles, dates, and organizations intact.
   - Only amplify, sharpen, reframe, and quantify genuine accomplishments in alignment with the target role.
4. FORMATTING:
   - Output valid, clean Markdown only.
   - Maintain standard sections: Contact Info, Professional Summary, Skills, Work Experience, Education, and Projects.
   - Do NOT wrap in backtick code fencing (no \`\`\`markdown or \`\`\`), no greetings, and no explanatory commentary. Output raw markdown directly.
`;

  try {
    let tailoredContent = (await callGemini(prompt)).trim();

    // Clean any accidental markdown fence wrappers
    tailoredContent = tailoredContent
      .replace(/^```(?:markdown)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    let targetResume;
    if (createCopy) {
      targetResume = await db.resume.create({
        data: {
          userId: user.id,
          title: `[Tailored] ${resume.title}`,
          content: tailoredContent,
          targetJobDescription,
        },
      });
    } else {
      targetResume = await db.resume.update({
        where: { id: resume.id },
        data: {
          content: tailoredContent,
          targetJobDescription,
        },
      });
    }

    revalidatePath("/resume");
    return targetResume;
  } catch (error) {
    console.error("Error tailoring resume to job:", error);
    throw new Error(error.message || "Failed to tailor resume to job description");
  }
}

export async function improveWithAI({ current, type }) {
  const user = await getAuthenticatedUser();

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry || "professional"}.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords
    
    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    const improvedContent = (await callGemini(prompt)).trim();
    return improvedContent;
  } catch (error) {
    console.error("Error improving content:", error);
    throw new Error("Failed to improve content");
  }
}
