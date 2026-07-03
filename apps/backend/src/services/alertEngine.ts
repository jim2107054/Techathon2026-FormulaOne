import type { Alert, Device, PrismaClient, Room } from "@prisma/client";

import { getNow } from "../lib/clock";
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

function isOutsideOfficeHours(now: Date) {
  const hour = now.getHours();
  return hour < 9 || hour >= 17;
}

function formatClock(now: Date) {
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const suffix = hour >= 12 ? "PM" : "AM";
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${twelveHour}:${paddedMinutes} ${suffix}`;
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

      if (isOutsideOfficeHours(now)) {
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
              message: `Hey! ${device.name} in ${device.room.displayName} is still on and it's ${formatClock(now)} — did someone forget to switch it off?`,
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

        const fanCount = room.devices.filter(
          (entry) => entry.type === "fan",
        ).length;
        const lightCount = room.devices.filter(
          (entry) => entry.type === "light",
        ).length;

        const alert = await deps.prismaClient.alert.create({
          data: {
            type: "continuous_run",
            roomId: room.id,
            message: `Heads-up — ${room.displayName} still has ${fanCount} fan${
              fanCount === 1 ? "" : "s"
            } and ${lightCount} light${
              lightCount === 1 ? "" : "s"
            } on, and they've been running non-stop for over 2 hours.`,
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
  const insideOfficeHours = !isOutsideOfficeHours(now);

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
  now: getNow,
});

export async function runAlertCheck() {
  await alertEngine.runAlertCheck();
}
