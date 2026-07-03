"use client";

import { useEffect, useState } from "react";
import type { Device, RoomWithDevices } from "@techathon/shared-types";

import { fetchJson } from "@/lib/api";
import { useSocket } from "./useSocket";

export function useRooms() {
  const { socket } = useSocket();
  const [rooms, setRooms] = useState<RoomWithDevices[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchJson<RoomWithDevices[]>("/api/rooms")
      .then((data) => {
        if (!active) {
          return;
        }

        setRooms(data);
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
