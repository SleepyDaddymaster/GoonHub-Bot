const { SlashCommandBuilder } = require("discord.js");
const { getDB } = require("../../services/database.service");

function getNeededXP(level) {
  return Math.floor(100 * Math.pow(1.5, level));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Level Leaderboard"),

  async execute(interaction) {

    const db = getDB();

    const top = db.prepare(`
      SELECT userId, level, xp 
      FROM levels
      ORDER BY level DESC, xp DESC
      LIMIT 10
    `).all();

    if (!top.length) {
      return interaction.reply({
        content: "❌ Keine Daten vorhanden!",
        flags: 64
      });
    }

    const medals = ["🥇", "🥈", "🥉"];

    let description = "";

    for (let i = 0; i < top.length; i++) {
      const user = top[i];

      const medal = medals[i] || `#${i + 1}`;
      const neededXP = getNeededXP(user.level);
      const remainingXP = neededXP - user.xp;

      description += `${medal} <@${user.userId}>\n`;
      description += `└ 📈 Level ${user.level} | ⚡ ${user.xp}/${neededXP} XP\n`;
      description += `└ ⏭️ Noch ${remainingXP} XP bis zum nächsten Level\n\n`;
    }

    return interaction.reply({
      embeds: [
        {
          title: " 🏆 Level Leaderboard",
          description: description.trim(),
          color: 0xFFD700,
          footer: {
            text: `Server: ${interaction.guild.name}`
          },
          timestamp: new Date()
        }
      ]
    });
  }
};