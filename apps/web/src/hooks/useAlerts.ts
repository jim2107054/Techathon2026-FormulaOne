"use client";

import { useEffect, useState } from "react";
import type { Alert } from "@techathon/shared-types";

import { fetchJson } from "@/lib/api";
import { useSocket } from "./useSocket";

export function useAlerts() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchJson<Alert[]>("/api/alerts")
      .then((data) => {
        if (!active) {
          return;
        }

        setAlerts(data);
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
    const handleAlert = (incomingAlert: Alert) => {
      setAlerts((currentAlerts) => [
        incomingAlert,
        ...currentAlerts.filter((alert) => alert.id !== incomingAlert.id),
      ]);
    };

    socket.on("alert:new", handleAlert);

    return () => {
      socket.off("alert:new", handleAlert);
    };
  }, [socket]);

  return { alerts, loading };
}
