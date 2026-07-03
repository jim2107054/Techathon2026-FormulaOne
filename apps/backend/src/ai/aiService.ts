import Anthropic from "@anthropic-ai/sdk";
import type { HumanizedResponse } from "@techathon/shared-types";

import { env } from "../config/env";

const anthropic = env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  : null;

export async function humanizeResponse(
  rawFacts: string,
  fallbackText: string,
): Promise<HumanizedResponse> {
  if (!anthropic) {
    return { text: fallbackText, source: "fallback" };
  }

  const timeoutPromise = new Promise<HumanizedResponse>((resolve) => {
    setTimeout(() => {
      resolve({ text: fallbackText, source: "fallback" });
    }, 4000);
  });

  const requestPromise = anthropic.messages
    .create({
      model: "claude-sonnet-4-6",
      max_tokens: 200,
      system:
        "Rewrite these office device facts as one short, friendly sentence or two, no more than 40 words, no markdown, no emoji spam (max 1 emoji), keep every number exactly as given.",
      messages: [
        {
          role: "user",
          content: rawFacts,
        },
      ],
    })
    .then((message) => {
      const text = message.content
        .filter((block) => block.type === "text")
        .map((block) => block.text.trim())
        .join(" ")
        .trim();

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
