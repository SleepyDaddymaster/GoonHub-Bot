require("dotenv").config();

const { createClient } = require("./core/client");

const loadEvents = require("./handlers/eventHandler");
const loadCommands = require("./handlers/commandHandler");
const interactionHandler = require("./handlers/interactionHandler");

const { getDB } = require("./services/database.service");
const InviteManager = require("./managers/invite.manager");

const client = createClient();

// initialize DB on startup
getDB();

client.managers = {
  invite: new InviteManager(client)
};

loadCommands(client);
loadEvents(client);
interactionHandler(client);

client.once("clientReady", async () => {
  console.log(`Bot logged in as ${client.user.tag}`);

  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();

      client.invites.set(
        guild.id,
        new Map(invites.map(i => [i.code, i]))
      );

      await client.managers.invite.loadInvites(guild);

      console.log(`Invites loaded for ${guild.name}`);
    } catch (err) {
      console.error(`Invite cache error (${guild.name}):`, err);
    }
  }
});

client.login(process.env.TOKEN);
