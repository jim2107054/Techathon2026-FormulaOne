import dotenv from "dotenv";

dotenv.config();

export const config = {
  discordBotToken: process.env.DISCORD_BOT_TOKEN ?? "",
  backendUrl: process.env.BACKEND_URL ?? "http://localhost:4000",
  botApiKey: process.env.BOT_API_KEY ?? "",
  alertChannelId: process.env.ALERT_CHANNEL_ID ?? "",
};
