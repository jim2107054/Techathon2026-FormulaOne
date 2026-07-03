import { Router } from "express";
import { z } from "zod";

import { humanizeResponse } from "../ai/aiService";
import { buildRoomFacts, buildStatusFacts, buildUsageFacts } from "../ai/factBuilders";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/HttpError";
import { prisma } from "../lib/prisma";
import { serializeRoomWithDevices } from "../lib/serializers";
import { requireBotApiKey } from "../middleware/requireBotApiKey";
import { getRoomsWithDevices, getUsageSummary } from "../services/roomService";

const humanizeAlertSchema = z.object({
  message: z.string().trim().min(1),
});

const queryLogSchema = z.object({
  command: z.string().trim().min(1),
  userId: z.string().trim().min(1),
});

export const botQueryRouter = Router();

botQueryRouter.use(requireBotApiKey);

botQueryRouter.get(
  "/status",
  asyncHandler(async (_request, response) => {
    const rooms = await getRoomsWithDevices();
    const fallbackText = buildStatusFacts(rooms);
    response.json(await humanizeResponse(fallbackText, fallbackText));
  }),
);

botQueryRouter.get(
  "/room/:id",
  asyncHandler(async (request, response) => {
    const rawRoomId = request.params.id;
    const roomId =
      typeof rawRoomId === "string" ? rawRoomId.trim().toLowerCase() : "";

    if (!roomId) {
      throw new HttpError(400, "Invalid room id");
    }

    const room = await prisma.room.findFirst({
      where: {
        OR: [{ id: roomId }, { name: roomId }],
      },
      include: {
        devices: {
          orderBy: [{ type: "asc" }, { name: "asc" }],
        },
      },
    });

    const serializedRoom = room ? serializeRoomWithDevices(room) : null;
    const fallbackText = buildRoomFacts(serializedRoom);
    response.json(await humanizeResponse(fallbackText, fallbackText));
  }),
);

botQueryRouter.get(
  "/usage",
  asyncHandler(async (_request, response) => {
    const usage = await getUsageSummary();
    const fallbackText = buildUsageFacts(usage);
    response.json(await humanizeResponse(fallbackText, fallbackText));
  }),
);

botQueryRouter.post(
  "/humanize-alert",
  asyncHandler(async (request, response) => {
    const parsed = humanizeAlertSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, "Invalid alert message");
    }

    response.json(
      await humanizeResponse(parsed.data.message, parsed.data.message),
    );
  }),
);

botQueryRouter.post(
  "/query-log",
  asyncHandler(async (request, response) => {
    const parsed = queryLogSchema.safeParse(request.body);

    if (!parsed.success) {
      throw new HttpError(400, "Invalid bot query log payload");
    }

    console.log(
      `[bot:query] user=${parsed.data.userId} command=${parsed.data.command}`,
    );
    response.json({ status: "ok" });
  }),
);
