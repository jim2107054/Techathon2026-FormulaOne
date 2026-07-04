import fs from "fs";
import path from "path";

import type { Device } from "@prisma/client";

type AccumulatorState = {
  dayKey: string;
  estimatedKwhToday: number;
};

const DATA_DIR = path.resolve(__dirname, "../../data");
const STATE_FILE = path.join(DATA_DIR, "usage-accumulator.json");
const WRITE_THROTTLE_MS = 15000;

const accumulatorState: AccumulatorState = {
  dayKey: "",
  estimatedKwhToday: 0,
};

let lastWriteAt = 0;

function getDayKey(now: Date) {
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function ensureCurrentDay(now: Date) {
  const dayKey = getDayKey(now);

  if (accumulatorState.dayKey !== dayKey) {
    accumulatorState.dayKey = dayKey;
    accumulatorState.estimatedKwhToday = 0;
  }
}

// Restore today's running total so a mid-day backend restart does not zero out usage.
function restoreFromDisk() {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf8");
    const saved = JSON.parse(raw) as Partial<AccumulatorState>;

    if (
      typeof saved.dayKey === "string" &&
      typeof saved.estimatedKwhToday === "number" &&
      saved.dayKey === getDayKey(new Date())
    ) {
      accumulatorState.dayKey = saved.dayKey;
      accumulatorState.estimatedKwhToday = saved.estimatedKwhToday;
    }
  } catch {
    // Missing or corrupt file is expected on a fresh start; begin from zero.
  }
}

function persistToDisk(now: Date) {
  if (now.getTime() - lastWriteAt < WRITE_THROTTLE_MS) {
    return;
  }

  lastWriteAt = now.getTime();

  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(accumulatorState), "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown write error";
    console.error(`[usage:persist] ${message}`);
  }
}

restoreFromDisk();

export function recordEnergySnapshot(
  devices: Device[],
  intervalMs: number,
  now: Date = new Date(),
) {
  ensureCurrentDay(now);

  const onWatts = devices
    .filter((device) => device.status === "on")
    .reduce((sum, device) => sum + device.wattage, 0);

  accumulatorState.estimatedKwhToday +=
    (onWatts / 1000) * (intervalMs / 1000 / 3600);

  persistToDisk(now);
}

export function getEstimatedKwhToday(now: Date = new Date()) {
  ensureCurrentDay(now);
  return Number(accumulatorState.estimatedKwhToday.toFixed(4));
}

export function resetEnergyAccumulator() {
  accumulatorState.dayKey = "";
  accumulatorState.estimatedKwhToday = 0;
  lastWriteAt = 0;
}
