import type { SimulatedDeviceDataSource } from "./SimulatedDeviceDataSource";

/*
 * Holds the single running simulator instance so demo/admin routes can reach it
 * without index.ts and the routes importing each other (which would create a cycle).
 */
let simulator: SimulatedDeviceDataSource | null = null;

export function setSimulator(instance: SimulatedDeviceDataSource) {
  simulator = instance;
}

export function getSimulator(): SimulatedDeviceDataSource {
  if (!simulator) {
    throw new Error("Simulator has not been initialized");
  }

  return simulator;
}
