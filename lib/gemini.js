import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Resilient multi-model priority list ordered by ultra-low latency & official availability
 */
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
];

const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.5,
  maxOutputTokens: 8192,
  topP: 0.9,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Resilient Gemini content generator with automatic model fallback and rate-limit backoff
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function callGemini(prompt, options = {}) {
  const config = { ...DEFAULT_GENERATION_CONFIG, ...options.generationConfig };
  let lastError = null;

  for (const modelName of MODEL_PRIORITY) {
    let attempts = 0;
    const maxAttempts = options.maxRetries ?? 2;

    while (attempts <= maxAttempts) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: config,
        });

        const result = await model.generateContent(prompt);
        const text = result?.response?.text();
        if (text) return text.trim();
        throw new Error("Empty response received from Gemini API");
      } catch (err) {
        attempts++;
        lastError = err;

        const isRateLimitOrDemand =
          err?.status === 429 ||
          err?.status === 503 ||
          err?.status === 500 ||
          err?.message?.includes("429") ||
          err?.message?.includes("503") ||
          err?.message?.toLowerCase().includes("quota") ||
          err?.message?.toLowerCase().includes("high demand") ||
          err?.message?.toLowerCase().includes("overloaded");

        const isModelUnavailable =
          err?.status === 404 ||
          err?.status === 400 ||
          err?.message?.includes("404") ||
          err?.message?.toLowerCase().includes("not found") ||
          err?.message?.toLowerCase().includes("no longer available") ||
          err?.message?.toLowerCase().includes("unsupported");

        // If model doesn't exist, skip immediately to next model
        if (isModelUnavailable) {
          console.warn(
            `[Gemini] ${modelName} is unavailable (${err.message}). Switching to next candidate model.`
          );
          break;
        }

        // On rate limits or transient errors, back off and retry the current active model
        if (isRateLimitOrDemand && attempts <= maxAttempts) {
          const delay = attempts * 1200;
          console.warn(
            `[Gemini] ${modelName} transient ${err.status || "demand"} error. Backing off ${delay}ms (attempt ${attempts}/${maxAttempts})...`
          );
          await sleep(delay);
          continue;
        }

        if (attempts <= maxAttempts) {
          const delay = attempts * 600;
          await sleep(delay);
        }
      }
    }
  }

  throw new Error(
    `AI service is temporarily busy. Please wait a moment and try again. (${lastError?.message || "Rate limit exceeded"})`
  );
}

/**
 * Robust JSON extraction with native responseMimeType support and schema validation
 * @template T
 * @param {string} prompt
 * @param {z.ZodType<T>} [schema]
 * @param {object} [options]
 * @returns {Promise<T>}
 */
export async function callGeminiJSON(prompt, schema = null, options = {}) {
  // Enforce native JSON output from Gemini
  const jsonOptions = {
    ...options,
    generationConfig: {
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
      ...options.generationConfig,
    },
  };

  const rawText = await callGemini(prompt, jsonOptions);

  // Clean any accidental markdown fence wrappers
  const cleanedText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleanedText);
  } catch (parseError) {
    // Secondary fallback: find first valid JSON block
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (secondErr) {
        console.error("[Gemini] Secondary parse failed:", cleanedText);
        throw new Error(`Malformed AI JSON: ${secondErr.message}`);
      }
    } else {
      throw new Error(`Malformed AI JSON response: ${parseError.message}`);
    }
  }

  if (schema) {
    const validation = schema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(`AI response failed schema validation: ${validation.error.message}`);
    }
    return validation.data;
  }

  return parsed;
}
