"use client";

import { useCallback, useEffect, useState } from "react";
import type { Alert } from "@techathon/shared-types";

import { fetchJson } from "@/lib/api";
import { useSocket } from "./useSocket";

export function useAlerts() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchJson<Alert[]>("/api/alerts");
      setAlerts(data);
    } catch {
      // Keep any existing alerts; a later (re)connect will retry the fetch.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  // Reload the alert backlog on socket (re)connect so the panel self-heals if
  // it loaded before the backend was up, or the backend restarted.
  useEffect(() => {
    const handleConnect = () => {
      void loadAlerts();
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, loadAlerts]);

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
