import { describe, expect, it } from "vitest";

import { createAlertEngine } from "./alertEngine";

type TestAlert = {
  id: string;
  type: string;
  roomId: string;
  deviceId?: string | null;
  message: string;
  createdAt: Date;
  resolved: boolean;
};

function createFakePrisma(seed?: {
  rooms?: Array<{ id: string; name: string; displayName: string }>;
  devices?: Array<{
    id: string;
    name: string;
    type: string;
    roomId: string;
    status: string;
    wattage: number;
    lastChangedAt: Date;
  }>;
  alerts?: TestAlert[];
}) {
  const rooms = seed?.rooms ?? [];
  const devices = seed?.devices ?? [];
  const alerts = seed?.alerts ?? [];

  return {
    room: {
      async findMany(args?: { include?: { devices: boolean } }) {
        if (args?.include?.devices) {
          return rooms.map((room) => ({
            ...room,
            devices: devices.filter((device) => device.roomId === room.id),
          }));
        }

        return rooms;
      },
    },
    device: {
      async findMany(args?: { include?: { room: boolean } }) {
        if (args?.include?.room) {
          return devices.map((device) => ({
            ...device,
            room: rooms.find((room) => room.id === device.roomId)!,
          }));
        }

        return devices;
      },
    },
    alert: {
      async findMany(args?: { where?: { resolved?: boolean } }) {
        if (args?.where?.resolved === false) {
          return alerts.filter((alert) => alert.resolved === false);
        }

        return alerts;
      },
      async create(args: { data: Omit<TestAlert, "id" | "createdAt" | "resolved"> }) {
        const alert: TestAlert = {
          id: `alert_${alerts.length + 1}`,
          createdAt: new Date(),
          resolved: false,
          ...args.data,
        };
        alerts.push(alert);
        return alert;
      },
      async update(args: { where: { id: string }; data: { resolved: boolean } }) {
        const alert = alerts.find((entry) => entry.id === args.where.id)!;
        alert.resolved = args.data.resolved;
        return alert;
      },
    },
  };
}

function buildRoomFixture() {
  const room = { id: "room_work1", name: "work1", displayName: "Work Room 1" };

  return {
    room,
    devices: [
      "Fan 1",
      "Fan 2",
      "Light 1",
      "Light 2",
      "Light 3",
    ].map((name, index) => ({
      id: `device_${index + 1}`,
      name,
      type: name.startsWith("Fan") ? "fan" : "light",
      roomId: room.id,
      status: "on",
      wattage: name.startsWith("Fan") ? 60 : 15,
      lastChangedAt: new Date(2026, 6, 3, 15, 0, 0),
    })),
  };
}

describe("alertEngine", () => {
  it("creates exactly one after-hours alert before 9:00 for an on device", async () => {
    const fixture = buildRoomFixture();
    fixture.devices = [fixture.devices[0]];
    const prismaClient = createFakePrisma({
      rooms: [fixture.room],
      devices: fixture.devices,
    });

    const engine = createAlertEngine({
      prismaClient: prismaClient as never,
      emitAlert: () => undefined,
      now: () => new Date(2026, 6, 3, 7, 30, 0),
    });

    await engine.runAlertCheck();
    const alerts = await prismaClient.alert.findMany();
    expect(alerts.filter((alert) => alert.type === "after_hours")).toHaveLength(1);
  });

  it("creates no after-hours alert during office hours and resolves existing ones", async () => {
    const fixture = buildRoomFixture();
    fixture.devices = [fixture.devices[0]];
    const prismaClient = createFakePrisma({
      rooms: [fixture.room],
      devices: fixture.devices,
      alerts: [
        {
          id: "alert_after_hours_existing",
          type: "after_hours",
          roomId: fixture.room.id,
          deviceId: fixture.devices[0].id,
          message: "Existing after-hours alert",
          createdAt: new Date(),
          resolved: false,
        },
      ],
    });

    const engine = createAlertEngine({
      prismaClient: prismaClient as never,
      emitAlert: () => undefined,
      now: () => new Date(2026, 6, 3, 12, 0, 0),
    });

    await engine.runAlertCheck();
    const alerts = await prismaClient.alert.findMany();
    const afterHours = alerts.filter((alert) => alert.type === "after_hours");
    expect(afterHours).toHaveLength(1);
    expect(afterHours.every((alert) => alert.resolved)).toBe(true);
  });

  it("creates exactly one after-hours alert for an on device", async () => {
    const fixture = buildRoomFixture();
    fixture.devices = [fixture.devices[0]];
    const prismaClient = createFakePrisma({
      rooms: [fixture.room],
      devices: fixture.devices,
    });

    const engine = createAlertEngine({
      prismaClient: prismaClient as never,
      emitAlert: () => undefined,
      now: () => new Date(2026, 6, 3, 18, 0, 0),
    });

    await engine.runAlertCheck();
    const alerts = await prismaClient.alert.findMany();
    expect(alerts.filter((alert) => alert.type === "after_hours")).toHaveLength(1);
  });

  it("does not duplicate after-hours alerts across repeated checks", async () => {
    const fixture = buildRoomFixture();
    fixture.devices = [fixture.devices[0]];
    const prismaClient = createFakePrisma({
      rooms: [fixture.room],
      devices: fixture.devices,
    });

    const engine = createAlertEngine({
      prismaClient: prismaClient as never,
      emitAlert: () => undefined,
      now: () => new Date(2026, 6, 3, 18, 0, 0),
    });

    await engine.runAlertCheck();
    await engine.runAlertCheck();

    const alerts = await prismaClient.alert.findMany();
    expect(alerts.filter((alert) => alert.type === "after_hours")).toHaveLength(1);
  });

  it("creates one continuous-run alert when all room devices are on for 2+ hours", async () => {
    const fixture = buildRoomFixture();
    const prismaClient = createFakePrisma({
      rooms: [fixture.room],
      devices: fixture.devices,
    });

    const engine = createAlertEngine({
      prismaClient: prismaClient as never,
      emitAlert: () => undefined,
      now: () => new Date(2026, 6, 3, 18, 0, 0),
    });

    await engine.runAlertCheck();
    const alerts = await prismaClient.alert.findMany();
    expect(alerts.filter((alert) => alert.type === "continuous_run")).toHaveLength(1);
  });

  it("resolves a continuous-run alert when one device turns off", async () => {
    const fixture = buildRoomFixture();
    const prismaClient = createFakePrisma({
      rooms: [fixture.room],
      devices: fixture.devices,
      alerts: [
        {
          id: "alert_existing",
          type: "continuous_run",
          roomId: fixture.room.id,
          message: "Existing alert",
          createdAt: new Date(),
          resolved: false,
        },
      ],
    });

    const engine = createAlertEngine({
      prismaClient: prismaClient as never,
      emitAlert: () => undefined,
      now: () => new Date(2026, 6, 3, 18, 0, 0),
    });

    fixture.devices[0].status = "off";

    await engine.runAlertCheck();
    const alerts = await prismaClient.alert.findMany();
    expect(alerts[0].resolved).toBe(true);
  });
});
