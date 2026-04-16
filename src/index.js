require("dotenv").config();

const { createClient } = require("./core/client");

const loadEvents = require("./handlers/eventHandler");
const loadCommands = require("./handlers/commandHandler");
const interactionHandler = require("./handlers/interactionHandler");

// DB LADEN 
const { getDB } = require("./services/database.service");
const db = getDB();

// MANAGER
const InviteManager = require("./managers/invite.manager");

const client = createClient();

// =============================
// MANAGER
// =============================
client.managers = {
  invite: new InviteManager(client)
};

console.log("✅ InviteManager geladen");

// =============================
// COMMANDS
// =============================
loadCommands(client);

// =============================
// EVENTS
// =============================
loadEvents(client);

// =============================
// INTERACTIONS
// =============================
interactionHandler(client);

// =============================
// READY EVENT
// =============================
client.once("clientReady", async () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);

  client.invites = new Map();

  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();

      client.invites.set(
        guild.id,
        new Map(invites.map(i => [i.code, i]))
      );

      console.log(`📨 Invites geladen für ${guild.name}`);
    } catch (err) {
      console.error("INVITE CACHE ERROR:", err);
    }
  }

  // =============================
  // AUTO GIVEAWAY END
  // =============================
  setInterval(() => {
    try {

      const giveaways = db.prepare(`
        SELECT * FROM giveaways WHERE ended=0 AND endAt < ?
      `).all(Date.now());

      for (const g of giveaways) {

        const entries = db.prepare(`
          SELECT userId FROM giveaway_entries WHERE giveawayId=?
        `).all(g.id);

        const channel = client.channels.cache.get(g.channelId);
        if (!channel) continue;

        let message;

        if (!entries.length) {
          message = "❌ Keine Teilnehmer, Giveaway beendet.";
        } else {
          const shuffled = entries.sort(() => 0.5 - Math.random());

          const winners = [];
          for (let i = 0; i < Math.min(g.winners, shuffled.length); i++) {
            winners.push(`<@${shuffled[i].userId}>`);
          }

          message = `🎉 Gewinner: ${winners.join(", ")}\n🎁 Prize: **${g.prize}**\n👤 Gestartet von: <@${g.hostId}>`;
        }

        channel.send({
          content: message,
          components: [{
            type: 1,
            components: [{
              type: 2,
              label: "🔁 Reroll",
              style: 2,
              custom_id: `reroll_${g.id}`
            }]
          }]
        });

        db.prepare(`UPDATE giveaways SET ended=1 WHERE id=?`).run(g.id);
      }

    } catch (err) {
      console.error("GIVEAWAY LOOP ERROR:", err);
    }
  }, 5000);
});

// =============================
// LOGIN
// =============================
client.login(process.env.TOKEN);
