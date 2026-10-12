import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Resilient multi-model priority list ordered by ultra-low latency & official availability
 */
const MODEL_PRIORITY = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
];

const DEFAULT_GENERATION_CONFIG = {
  temperature: 0.5,
  maxOutputTokens: 8192,
  topP: 0.9,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Resilient Gemini content generator with automatic model fallback
 * @param {string} prompt
 * @param {object} options
 * @returns {Promise<string>}
 */
export async function callGemini(prompt, options = {}) {
  const config = { ...DEFAULT_GENERATION_CONFIG, ...options.generationConfig };
  let lastError = null;

  for (const modelName of MODEL_PRIORITY) {
    let attempts = 0;
    const maxAttempts = options.maxRetries ?? 1;

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

        const isFatalOrHighDemand =
          err?.status === 429 ||
          err?.status === 503 ||
          err?.status === 500 ||
          err?.message?.includes("429") ||
          err?.message?.includes("503") ||
          err?.message?.includes("500") ||
          err?.message?.toLowerCase().includes("quota") ||
          err?.message?.toLowerCase().includes("high demand") ||
          err?.message?.toLowerCase().includes("overloaded");

        const isNonRetryable =
          err?.status === 404 ||
          err?.status === 400 ||
          err?.message?.includes("404") ||
          err?.message?.includes("400") ||
          err?.message?.toLowerCase().includes("not found") ||
          err?.message?.toLowerCase().includes("unsupported");

        // On rate-limits, 503 high-demand, 404, or server errors, switch immediately to next fallback model
        if (isFatalOrHighDemand || isNonRetryable) {
          console.warn(
            `[Gemini] ${modelName} error (${err.message}). Immediately falling back to next candidate model.`
          );
          break;
        }

        if (attempts <= maxAttempts) {
          const delay = Math.pow(2, attempts) * 400;
          await sleep(delay);
        }
      }
    }
  }

  throw new Error(
    `All AI models failed to respond. Last error: ${lastError?.message || "Unknown error"}`
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
