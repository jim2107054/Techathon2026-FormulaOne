import type { RoomWithDevices, UsageSummary } from "@techathon/shared-types";

import { prisma } from "../lib/prisma";
import { serializeRoomWithDevices } from "../lib/serializers";
import { getEstimatedKwhToday } from "./energyAccumulator";

export async function getRoomsWithDevices(): Promise<RoomWithDevices[]> {
  const rooms = await prisma.room.findMany({
    orderBy: { name: "asc" },
    include: {
      devices: {
        orderBy: [{ type: "asc" }, { name: "asc" }],
      },
    },
  });

  return rooms.map(serializeRoomWithDevices);
}

export async function getUsageSummary(): Promise<UsageSummary> {
  const rooms = await prisma.room.findMany({
    include: {
      devices: true,
    },
    orderBy: { name: "asc" },
  });

  const perRoomWatts = rooms.reduce<Record<string, number>>((result, room) => {
    result[room.name] = room.devices
      .filter((device) => device.status === "on")
      .reduce((sum, device) => sum + device.wattage, 0);
    return result;
  }, {});

  const totalWattsNow = Object.values(perRoomWatts).reduce(
    (sum, watts) => sum + watts,
    0,
  );

  return {
    totalWattsNow,
    perRoomWatts,
    estimatedKwhToday: getEstimatedKwhToday(),
  };
}
