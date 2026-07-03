import type { Device } from "@prisma/client";

type AccumulatorState = {
  dayKey: string;
  estimatedKwhToday: number;
};

const accumulatorState: AccumulatorState = {
  dayKey: "",
  estimatedKwhToday: 0,
};

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
}

export function getEstimatedKwhToday(now: Date = new Date()) {
  ensureCurrentDay(now);
  return Number(accumulatorState.estimatedKwhToday.toFixed(4));
}

export function resetEnergyAccumulator() {
  accumulatorState.dayKey = "";
  accumulatorState.estimatedKwhToday = 0;
}
