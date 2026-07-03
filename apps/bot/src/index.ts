import {
  Client,
  Events,
  GatewayIntentBits,
  Message,
} from "discord.js";

import { startAlertListener } from "./alertListener";
import { handleRoom } from "./commands/room";
import { handleStatus } from "./commands/status";
import { handleUsage } from "./commands/usage";
import { config } from "./config";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  startAlertListener(client);
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot || !message.content.startsWith("!")) {
    return;
  }

  const [command, ...args] = message.content.trim().split(/\s+/);

  switch (command.toLowerCase()) {
    case "!status":
      await handleStatus(message);
      return;
    case "!room":
      await handleRoom(message, args);
      return;
    case "!usage":
      await handleUsage(message);
      return;
    default:
      await message.reply("Available commands: !status, !room <name>, !usage");
  }
});

if (!config.discordBotToken) {
  console.error("DISCORD_BOT_TOKEN is missing.");
  process.exit(1);
}

void client.login(config.discordBotToken);
