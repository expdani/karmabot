import { readdirSync } from "fs";
import { Collection, GatewayIntentBits } from "discord.js";
import { env } from "../environment";
import { DiscordClient } from "./classes/discord";

const client = new DiscordClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageTyping,
  ],
});

client.commands = new Collection();

const eventFiles = readdirSync("./src/events").filter(
  (file: any) => file.endsWith(".ts") || file.endsWith(".js")
);

client.login(env.DISCORD_API_KEY);

for (const file of eventFiles) {
  const eventName = file.split(".")[0];
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(eventName, (...args) => event.execute(client, ...args));
  } else {
    client.on(eventName, (...args) => event.execute(client, ...args));
  }
}

process.on("SIGINT", () => {
  client.destroy();
  process.exit(0);
});

module.exports = client;
