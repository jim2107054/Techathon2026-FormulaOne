import type {
  Alert,
  Device,
  RoomWithDevices,
  UsageSummary,
} from "@techathon/shared-types";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function getBackendUrl() {
  return baseUrl;
}

export type { Alert, Device, RoomWithDevices, UsageSummary };
