const { Client, GatewayIntentBits, Collection } = require("discord.js");

function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.commands = new Collection();
  client.cooldowns = new Collection();
  client.invites = new Map();
  client.tempGiveaways = new Map();
  client.activeGiveaways = new Map();

  return client;
}

module.exports = { createClient };
