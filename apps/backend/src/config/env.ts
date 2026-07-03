import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_ORIGIN: z.string().trim().min(1),
  DATABASE_URL: z.string().trim().min(1),
  BOT_API_KEY: z.string().trim().min(1),
  GEMINI_API_KEY: z.string().trim().optional().or(z.literal("")),
  SIMULATION_INTERVAL_MS: z.coerce.number().int().positive().default(15000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missingVars = parsed.error.issues
    .map((issue) => issue.path.join("."))
    .filter(Boolean);

  console.error(
    `Missing or invalid environment variables: ${missingVars.join(", ")}`,
  );
  process.exit(1);
}

if (!parsed.data.GEMINI_API_KEY) {
  console.warn(
    "GEMINI_API_KEY is not set. AI responses will use deterministic fallback text.",
  );
}

export const env = {
  ...parsed.data,
  GEMINI_API_KEY: parsed.data.GEMINI_API_KEY || undefined,
};
