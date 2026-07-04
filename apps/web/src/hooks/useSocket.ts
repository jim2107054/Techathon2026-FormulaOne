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
  // Always start "false" so the server-rendered HTML and the first client render
  // agree. The socket singleton can already be connected on the server (it persists
  // across SSR requests and dials the backend), which would render "Live" on the
  // server while the client starts "Disconnected" — a hydration mismatch. Real
  // connection state is applied after mount in the effect below.
  const [connected, setConnected] = useState(false);

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
