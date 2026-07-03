"use client";

import { useCallback, useEffect, useState } from "react";
import type { Device, RoomWithDevices } from "@techathon/shared-types";

import { fetchJson } from "@/lib/api";
import { useSocket } from "./useSocket";

export function useRooms() {
  const { socket } = useSocket();
  const [rooms, setRooms] = useState<RoomWithDevices[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    try {
      const data = await fetchJson<RoomWithDevices[]>("/api/rooms");
      setRooms(data);
    } catch {
      // Keep any existing rooms; a later (re)connect will retry the fetch.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  // Re-fetch the full room list whenever the socket (re)connects, so the
  // dashboard self-heals if it loaded before the backend was up, or if the
  // backend restarts mid-session. Without this, an initial fetch that failed
  // while the backend was down would leave the device list permanently empty.
  useEffect(() => {
    const handleConnect = () => {
      void loadRooms();
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket, loadRooms]);

  useEffect(() => {
    const handleDeviceUpdate = (updatedDevice: Device) => {
      setRooms((currentRooms) =>
        currentRooms.map((room) => {
          if (room.id !== updatedDevice.roomId) {
            return room;
          }

          return {
            ...room,
            devices: room.devices.map((device) =>
              device.id === updatedDevice.id ? updatedDevice : device,
            ),
          };
        }),
      );
    };

    socket.on("device:update", handleDeviceUpdate);

    return () => {
      socket.off("device:update", handleDeviceUpdate);
    };
  }, [socket]);

  return { rooms, loading };
}
