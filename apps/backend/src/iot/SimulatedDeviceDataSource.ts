import type { Device } from "@prisma/client";

import { env } from "../config/env";
import { getNow, setDemoTime } from "../lib/clock";
import { prisma } from "../lib/prisma";
import { serializeDevice } from "../lib/serializers";
import { getIO } from "../realtime/socket";
import type { DeviceDataSource } from "./DeviceDataSource";

type SimulatorOptions = {
  intervalMs?: number;
  now?: () => Date;
  onTickComplete?: () => Promise<void>;
};

export type DemoScenario =
  | "workroom2-after-hours"
  | "all-off"
  | "reset";

type ForceScenarioOptions = {
  demoTime?: string;
};

export class SimulatedDeviceDataSource implements DeviceDataSource {
  private readonly intervalMs: number;

  private readonly now: () => Date;

  private readonly onTickComplete?: () => Promise<void>;

  private isTicking = false;

  private paused = false;

  constructor(options: SimulatorOptions = {}) {
    this.intervalMs = options.intervalMs ?? env.SIMULATION_INTERVAL_MS;
    this.now = options.now ?? getNow;
    this.onTickComplete = options.onTickComplete;
  }

  start(onDeviceChange: (deviceId: string, status: "on" | "off") => Promise<void>) {
    void this.runTick(onDeviceChange);

    setInterval(() => {
      void this.runTick(onDeviceChange);
    }, this.intervalMs);
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  private async runTick(
    onDeviceChange: (deviceId: string, status: "on" | "off") => Promise<void>,
  ) {
    if (this.paused || this.isTicking) {
      return;
    }

    this.isTicking = true;

    try {
      const devices = await prisma.device.findMany({
        include: { room: true },
      });

      if (devices.length === 0) {
        return;
      }

      const subsetSize = this.randomInteger(1, Math.min(3, devices.length));
      const shuffled = [...devices].sort(() => Math.random() - 0.5);
      const selectedDevices = shuffled.slice(0, subsetSize);
      const now = this.now();

      for (const device of selectedDevices) {
        const toggleChance = this.getToggleChance(device, now);
        const shouldToggle = Math.random() < toggleChance;

        if (!shouldToggle) {
          continue;
        }

        const nextStatus = device.status === "on" ? "off" : "on";
        console.log(`[sim] ${device.name} (${device.room.name}) -> ${nextStatus}`);
        await onDeviceChange(device.id, nextStatus);
      }

      if (this.onTickComplete) {
        await this.onTickComplete();
      }
    } finally {
      this.isTicking = false;
    }
  }

  /*
   * Deterministic demo hook. Flips the office into a known state so alerts (and the
   * bot's proactive Discord message) fire on cue during a live demo. It persists the
   * changes itself and emits device:update directly, because the back-dated
   * lastChangedAt that drives the continuous-run rule must not be overwritten by the
   * normal onDeviceChange path (which stamps lastChangedAt to the current time).
   */
  async forceScenario(name: DemoScenario, opts: ForceScenarioOptions = {}) {
    if (name === "reset") {
      setDemoTime(null);
      this.paused = false;
      return;
    }

    if (name === "all-off") {
      setDemoTime(null);
      const devices = await prisma.device.findMany();
      await this.applyDeviceState(
        devices.map((device) => ({ id: device.id, status: "off" as const })),
        getNow(),
      );
      return;
    }

    // "workroom2-after-hours"
    this.paused = true;

    if (opts.demoTime) {
      setDemoTime(this.buildDemoDate(opts.demoTime));
    }

    const backdated = new Date(getNow().getTime() - 3 * 60 * 60 * 1000);
    const work2Devices = await prisma.device.findMany({
      where: { room: { name: "work2" } },
    });

    await this.applyDeviceState(
      work2Devices.map((device) => ({ id: device.id, status: "on" as const })),
      backdated,
    );
  }

  private async applyDeviceState(
    changes: Array<{ id: string; status: "on" | "off" }>,
    lastChangedAt: Date,
  ) {
    for (const change of changes) {
      const updated = await prisma.device.update({
        where: { id: change.id },
        data: { status: change.status, lastChangedAt },
      });

      getIO().emit("device:update", serializeDevice(updated));
    }
  }

  private buildDemoDate(hhmm: string) {
    const [hours, minutes] = hhmm.split(":").map((part) => Number(part));
    const base = new Date();
    return new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      Number.isFinite(hours) ? hours : 0,
      Number.isFinite(minutes) ? minutes : 0,
      0,
      0,
    );
  }

  private getToggleChance(device: Device & { room: { name: string } }, now: Date) {
    const hour = now.getHours();
    const isAfterHours = hour < 9 || hour >= 17;

    if (device.room.name === "drawing" && isAfterHours) {
      return device.status === "off" ? 0.45 : 0.2;
    }

    return 0.3;
  }

  private randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
