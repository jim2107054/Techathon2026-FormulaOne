import type { Message } from "discord.js";

import { api } from "../api";

export async function handleRoom(message: Message, args: string[]) {
  const roomId = args.join(" ").trim().toLowerCase();

  if (!roomId) {
    await message.reply("Which room? Try: drawing, work1, or work2.");
    return;
  }

  try {
    await api.post("/api/bot/query-log", {
      command: `!room ${roomId}`,
      userId: message.author.id,
    });

    const response = await api.get<{ text: string }>(
      `/api/bot/room/${encodeURIComponent(roomId)}`,
    );
    await message.reply(response.data.text);
  } catch {
    await message.reply(
      "I couldn't reach the office system right now - try again in a moment.",
    );
  }
}
