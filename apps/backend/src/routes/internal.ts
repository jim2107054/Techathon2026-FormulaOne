import { Router } from "express";
import { z } from "zod";

import { getSimulator } from "../iot/simulatorRegistry";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/HttpError";
import { requireBotApiKey } from "../middleware/requireBotApiKey";
import { runAlertCheck } from "../services/alertEngine";

/*
 * Demo/admin surface. These endpoints mutate live device state to make alerts fire on
 * cue during a presentation, so they are guarded by the bot API key and namespaced under
 * /internal to mark them as non-public. In production this router would be disabled or
 * placed behind separate authentication.
 */
const scenarioSchema = z.object({
  scenario: z.enum(["workroom2-after-hours", "all-off", "reset"]),
  demoTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "demoTime must be HH:MM")
    .optional(),
});

export const internalRouter = Router();

internalRouter.use(requireBotApiKey);

internalRouter.post(
  "/scenario",
  asyncHandler(async (request, response) => {
    const parsed = scenarioSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, "Invalid scenario payload");
    }

    await getSimulator().forceScenario(parsed.data.scenario, {
      demoTime: parsed.data.demoTime,
    });

    await runAlertCheck();

    response.json({
      ok: true,
      scenario: parsed.data.scenario,
      demoTime: parsed.data.demoTime ?? null,
    });
  }),
);
