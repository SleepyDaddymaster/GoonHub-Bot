const automod = require("../../modules/automod/automod.event");
const level = require("../../modules/level/level.event");

module.exports = {
  name: "messageCreate",

  async execute(msg, client) { // ✅ CLIENT HIER!
    try {
      if (!msg.guild || msg.author.bot) return;

      // 🛡️ AutoMod
      await automod.run(msg, client); // ✅ CLIENT MITGEBEN

      // 📈 Level System
      await level.run(msg, client); // (optional, falls du später brauchst)

    } catch (err) {
      console.error("❌ Fehler im messageCreate Event:", err);
    }
  }
};