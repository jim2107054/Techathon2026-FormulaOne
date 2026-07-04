import { GoogleGenAI } from "@google/genai";
import type { HumanizedResponse } from "@techathon/shared-types";

import { env } from "../config/env";

const genai = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;

const MODEL = "gemini-2.0-flash";

const SYSTEM_INSTRUCTION =
  "Rewrite these office device facts as one short, friendly sentence or two, no more than 40 words, no markdown, no emoji spam (max 1 emoji), keep every number exactly as given.";

export async function humanizeResponse(
  rawFacts: string,
  fallbackText: string,
): Promise<HumanizedResponse> {
  if (!genai) {
    return { text: fallbackText, source: "fallback" };
  }

  const timeoutPromise = new Promise<HumanizedResponse>((resolve) => {
    setTimeout(() => {
      resolve({ text: fallbackText, source: "fallback" });
    }, 4000);
  });

  const requestPromise = genai.models
    .generateContent({
      model: MODEL,
      contents: rawFacts,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 200,
      },
    })
    .then((response) => {
      const text = (response.text ?? "").trim();

      if (!text) {
        throw new Error("AI returned an empty response");
      }

      return {
        text,
        source: "ai" as const,
      };
    });

  try {
    return await Promise.race([requestPromise, timeoutPromise]);
  } catch (error) {
    console.error("AI humanization failed:", error);
    return { text: fallbackText, source: "fallback" };
  }
}
