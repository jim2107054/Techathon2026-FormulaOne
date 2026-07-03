"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import { getBackendUrl } from "@/lib/api";

let socketSingleton: Socket | null = null;

function getSocketInstance() {
  if (!socketSingleton) {
    socketSingleton = io(getBackendUrl(), {
      transports: ["websocket", "polling"],
    });
  }

  return socketSingleton;
}

export function useSocket() {
  const [connected, setConnected] = useState(() => getSocketInstance().connected);

  useEffect(() => {
    const socket = getSocketInstance();
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  return {
    connected,
    socket: getSocketInstance(),
  };
}
