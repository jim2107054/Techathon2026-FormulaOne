import type { Server as HttpServer } from "http";

import { Server } from "socket.io";

import { env } from "../config/env";

let io: Server | null = null;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: env.WEB_ORIGIN,
    },
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }

  return io;
}
