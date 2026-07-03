import http from "http";

import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";

import { env } from "./config/env";
import { SimulatedDeviceDataSource } from "./iot/SimulatedDeviceDataSource";
import { setSimulator } from "./iot/simulatorRegistry";
import { prisma } from "./lib/prisma";
import { serializeDevice } from "./lib/serializers";
import { errorHandler, requestLogger } from "./middleware/errorHandler";
import { initSocket, getIO } from "./realtime/socket";
import { alertsRouter } from "./routes/alerts";
import { botQueryRouter } from "./routes/botQuery";
import { internalRouter } from "./routes/internal";
import { roomsRouter } from "./routes/rooms";
import { usageRouter } from "./routes/usage";
import { recordEnergySnapshot } from "./services/energyAccumulator";
import { runAlertCheck } from "./services/alertEngine";

const app = express();
const server = http.createServer(app);
const io = initSocket(server);

app.use(cors({ origin: env.WEB_ORIGIN }));
app.use(express.json());
app.use(requestLogger);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, slow down",
  },
});

app.use("/api", apiLimiter);

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

app.use("/api", roomsRouter);
app.use("/api", usageRouter);
app.use("/api", alertsRouter);
app.use("/api/bot", botQueryRouter);
app.use("/internal", internalRouter);
app.use(errorHandler);

const simulator = new SimulatedDeviceDataSource({
  intervalMs: env.SIMULATION_INTERVAL_MS,
  onTickComplete: async () => {
    const allDevices = await prisma.device.findMany();
    recordEnergySnapshot(allDevices, env.SIMULATION_INTERVAL_MS);
    await runAlertCheck();
  },
});

setSimulator(simulator);

simulator.start(async (deviceId, status) => {
  try {
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        status,
        lastChangedAt: new Date(),
      },
    });

    getIO().emit("device:update", serializeDevice(updatedDevice));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    console.error(`[sim:error] ${message}`);
  }
});

server.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});

void io;
