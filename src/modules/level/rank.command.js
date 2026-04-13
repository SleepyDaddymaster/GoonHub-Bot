const { SlashCommandBuilder } = require("discord.js");
const { getDB } = require("../../services/database.service");
const db = getDB();

function getNeededXP(level) {
  return Math.floor(100 * Math.pow(1.5, level));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Zeigt dein Level"),

  async execute(interaction) {

    const db = getDB(); // 🔥 FIX

    let user = db.prepare(`
      SELECT * FROM levels WHERE userId=?
    `).get(interaction.user.id);

    if (!user) {
      return interaction.reply({
        content: "❌ Du hast noch keine XP!",
        flags: 64
      });
    }

    const neededXP = getNeededXP(user.level);

    // 🔝 RANK BERECHNEN
    const all = db.prepare(`
      SELECT userId, level, xp FROM levels
      ORDER BY level DESC, xp DESC
    `).all();

    const rank = all.findIndex(u => u.userId === interaction.user.id) + 1;

    return interaction.reply({
      embeds: [
        {
          title: "📊 Dein Rank",
          description: `${interaction.user}`,
          color: 0x00AAFF,
          fields: [
            {
              name: "🏆 Level",
              value: `${user.level}`,
              inline: true
            },
            {
              name: "⚡ XP",
              value: `${user.xp}/${neededXP}`,
              inline: true
            },
            {
              name: "🥇 Rank",
              value: `#${rank}`,
              inline: true
            }
          ],
          timestamp: new Date()
        }
      ]
    });
  }
};