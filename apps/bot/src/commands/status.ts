import type { Message } from "discord.js";

import { api } from "../api";

export async function handleStatus(message: Message) {
  try {
    await api.post("/api/bot/query-log", {
      command: "!status",
      userId: message.author.id,
    });

    const response = await api.get<{ text: string }>("/api/bot/status");
    await message.reply(response.data.text);
  } catch {
    await message.reply(
      "I couldn't reach the office system right now - try again in a moment.",
    );
  }
}
