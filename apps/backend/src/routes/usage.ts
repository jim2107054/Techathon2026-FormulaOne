import { Router } from "express";

import { asyncHandler } from "../lib/asyncHandler";
import { getUsageSummary } from "../services/roomService";

export const usageRouter = Router();

usageRouter.get(
  "/usage",
  asyncHandler(async (_request, response) => {
    response.json(await getUsageSummary());
  }),
);
