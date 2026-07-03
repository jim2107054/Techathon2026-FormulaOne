import type { Device } from "@prisma/client";

import { env } from "../config/env";
import { prisma } from "../lib/prisma";
import type { DeviceDataSource } from "./DeviceDataSource";

type SimulatorOptions = {
  intervalMs?: number;
  now?: () => Date;
  onTickComplete?: () => Promise<void>;
};

export class SimulatedDeviceDataSource implements DeviceDataSource {
  private readonly intervalMs: number;

  private readonly now: () => Date;

  private readonly onTickComplete?: () => Promise<void>;

  constructor(options: SimulatorOptions = {}) {
    this.intervalMs = options.intervalMs ?? env.SIMULATION_INTERVAL_MS;
    this.now = options.now ?? (() => new Date());
    this.onTickComplete = options.onTickComplete;
  }

  start(onDeviceChange: (deviceId: string, status: "on" | "off") => Promise<void>) {
    void this.runTick(onDeviceChange);

    setInterval(() => {
      void this.runTick(onDeviceChange);
    }, this.intervalMs);
  }

  private async runTick(
    onDeviceChange: (deviceId: string, status: "on" | "off") => Promise<void>,
  ) {
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

    // TODO: Accept a forceScenario override later to make specific demos reproducible on demand.
    if (this.onTickComplete) {
      await this.onTickComplete();
    }
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
