import type { Alert, Device, PrismaClient, Room } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { serializeAlert } from "../lib/serializers";
import { getIO } from "../realtime/socket";

type AlertEngineDeps = {
  prismaClient: Pick<PrismaClient, "alert" | "device" | "room">;
  emitAlert: (alert: Alert) => void;
  now: () => Date;
};

type DeviceWithRoom = Device & { room: Room };
type RoomWithDevices = Room & { devices: Device[] };

function isAfterHours(now: Date) {
  const hour = now.getHours();
  return hour >= 17;
}

function isContinuousRunRoom(room: RoomWithDevices, now: Date) {
  return (
    room.devices.length > 0 &&
    room.devices.every((device) => {
      if (device.status !== "on") {
        return false;
      }

      const diffMs = now.getTime() - device.lastChangedAt.getTime();
      return diffMs >= 2 * 60 * 60 * 1000;
    })
  );
}

export function createAlertEngine(deps: AlertEngineDeps) {
  return {
    async runAlertCheck() {
      const now = deps.now();
      const unresolvedAlerts = await deps.prismaClient.alert.findMany({
        where: { resolved: false },
      });

      const devices = (await deps.prismaClient.device.findMany({
        include: { room: true },
      })) as DeviceWithRoom[];

      const rooms = (await deps.prismaClient.room.findMany({
        include: { devices: true },
      })) as RoomWithDevices[];

      await resolveAfterHoursAlerts(
        deps.prismaClient,
        unresolvedAlerts.filter((alert) => alert.type === "after_hours"),
        devices,
        now,
      );

      await resolveContinuousRunAlerts(
        deps.prismaClient,
        unresolvedAlerts.filter((alert) => alert.type === "continuous_run"),
        rooms,
        now,
      );

      if (isAfterHours(now)) {
        for (const device of devices.filter((entry) => entry.status === "on")) {
          const existingAlert = unresolvedAlerts.find(
            (alert) =>
              alert.type === "after_hours" && alert.deviceId === device.id,
          );

          if (existingAlert) {
            continue;
          }

          const alert = await deps.prismaClient.alert.create({
            data: {
              type: "after_hours",
              roomId: device.roomId,
              deviceId: device.id,
              message: `${device.name} in ${device.room.displayName} is still on after hours`,
            },
          });

          deps.emitAlert(alert);
          unresolvedAlerts.push(alert);
        }
      }

      for (const room of rooms) {
        if (!isContinuousRunRoom(room, now)) {
          continue;
        }

        const existingAlert = unresolvedAlerts.find(
          (alert) => alert.type === "continuous_run" && alert.roomId === room.id,
        );

        if (existingAlert) {
          continue;
        }

        const alert = await deps.prismaClient.alert.create({
          data: {
            type: "continuous_run",
            roomId: room.id,
            message: `${room.displayName} has had all devices on for over 2 hours`,
          },
        });

        deps.emitAlert(alert);
        unresolvedAlerts.push(alert);
      }
    },
  };
}

async function resolveAfterHoursAlerts(
  prismaClient: AlertEngineDeps["prismaClient"],
  alerts: Alert[],
  devices: DeviceWithRoom[],
  now: Date,
) {
  const insideOfficeHours = !isAfterHours(now);

  for (const alert of alerts) {
    const device = devices.find((entry) => entry.id === alert.deviceId);

    if (!device || device.status === "off" || insideOfficeHours) {
      await prismaClient.alert.update({
        where: { id: alert.id },
        data: { resolved: true },
      });
    }
  }
}

async function resolveContinuousRunAlerts(
  prismaClient: AlertEngineDeps["prismaClient"],
  alerts: Alert[],
  rooms: RoomWithDevices[],
  now: Date,
) {
  for (const alert of alerts) {
    const room = rooms.find((entry) => entry.id === alert.roomId);

    if (!room || !isContinuousRunRoom(room, now)) {
      await prismaClient.alert.update({
        where: { id: alert.id },
        data: { resolved: true },
      });
    }
  }
}

const alertEngine = createAlertEngine({
  prismaClient: prisma,
  emitAlert: (alert) => {
    getIO().emit("alert:new", serializeAlert(alert));
  },
  now: () => new Date(),
});

export async function runAlertCheck() {
  await alertEngine.runAlertCheck();
}
