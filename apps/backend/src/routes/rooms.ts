import { Router } from "express";
import { z } from "zod";

import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../lib/HttpError";
import { prisma } from "../lib/prisma";
import { serializeDevice, serializeRoomWithDevices } from "../lib/serializers";

const roomIdSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9_-]+$/i);

export const roomsRouter = Router();

roomsRouter.get(
  "/rooms",
  asyncHandler(async (_request, response) => {
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" },
      include: {
        devices: {
          orderBy: [{ type: "asc" }, { name: "asc" }],
        },
      },
    });

    response.json(rooms.map(serializeRoomWithDevices));
  }),
);

roomsRouter.get(
  "/rooms/:id",
  asyncHandler(async (request, response) => {
    const parsedId = roomIdSchema.safeParse(request.params.id);

    if (!parsedId.success) {
      throw new HttpError(400, "Invalid room id");
    }

    const room = await prisma.room.findFirst({
      where: {
        OR: [{ id: parsedId.data }, { name: parsedId.data.toLowerCase() }],
      },
      include: {
        devices: {
          orderBy: [{ type: "asc" }, { name: "asc" }],
        },
      },
    });

    if (!room) {
      throw new HttpError(404, "Room not found");
    }

    response.json(serializeRoomWithDevices(room));
  }),
);

roomsRouter.get(
  "/devices",
  asyncHandler(async (_request, response) => {
    const devices = await prisma.device.findMany({
      orderBy: [{ roomId: "asc" }, { type: "asc" }, { name: "asc" }],
    });

    response.json(devices.map(serializeDevice));
  }),
);
