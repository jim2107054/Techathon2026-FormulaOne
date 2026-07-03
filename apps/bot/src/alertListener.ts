import type { Client } from "discord.js";
import { io } from "socket.io-client";

import { api } from "./api";
import { config } from "./config";

const postedAlertIds = new Set<string>();

type AlertPayload = {
  id: string;
  message: string;
};

export function startAlertListener(client: Client) {
  const socket = io(config.backendUrl, {
    autoConnect: true,
  });

  socket.on("alert:new", async (alert: AlertPayload) => {
    if (postedAlertIds.has(alert.id) || !config.alertChannelId) {
      return;
    }

    try {
      const response = await api.post<{ text: string }>("/api/bot/humanize-alert", {
        message: alert.message,
      });
      const channel = await client.channels.fetch(config.alertChannelId);

      if (!channel || !("send" in channel)) {
        return;
      }

      const textChannel = channel as { send: (content: string) => Promise<unknown> };
      await textChannel.send(`Warning: ${response.data.text}`);
      postedAlertIds.add(alert.id);
    } catch (error) {
      console.error("Failed to post proactive alert:", error);
    }
  });
}
