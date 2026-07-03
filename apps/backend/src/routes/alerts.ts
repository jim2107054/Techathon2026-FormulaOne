import { Router } from "express";

import { asyncHandler } from "../lib/asyncHandler";
import { prisma } from "../lib/prisma";
import { serializeAlert } from "../lib/serializers";

export const alertsRouter = Router();

alertsRouter.get(
  "/alerts",
  asyncHandler(async (request, response) => {
    const includeResolved = request.query.includeResolved === "true";
    const alerts = await prisma.alert.findMany({
      where: includeResolved ? undefined : { resolved: false },
      orderBy: { createdAt: "desc" },
    });

    response.json(alerts.map(serializeAlert));
  }),
);
