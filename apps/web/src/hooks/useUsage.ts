"use client";

import { useEffect, useState } from "react";
import type { Device, UsageSummary } from "@techathon/shared-types";

import { fetchJson } from "@/lib/api";
import { useSocket } from "./useSocket";

const emptyUsage: UsageSummary = {
  totalWattsNow: 0,
  perRoomWatts: {},
  estimatedKwhToday: 0,
};

export function useUsage() {
  const { socket } = useSocket();
  const [usage, setUsage] = useState<UsageSummary>(emptyUsage);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchJson<UsageSummary>("/api/usage")
      .then((data) => {
        if (!active) {
          return;
        }

        setUsage(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleDeviceUpdate = (_updatedDevice: Device) => {
      void fetchJson<UsageSummary>("/api/usage")
        .then((data) => {
          setUsage(data);
        })
        .catch(() => undefined);
    };

    socket.on("device:update", handleDeviceUpdate);

    return () => {
      socket.off("device:update", handleDeviceUpdate);
    };
  }, [socket]);

  return { usage, loading };
}
