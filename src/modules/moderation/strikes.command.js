const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("strikes")
    .setDescription("Zeigt Strikes eines Users")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User auswählen")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const target = interaction.options.getUser("user") || interaction.user;

    const db = client.inviteManager.db; // wir nutzen deine DB
    const data = db.prepare(`
      SELECT * FROM strikes
      WHERE guildId=? AND userId=?
    `).get(interaction.guild.id, target.id) || {
      invites: 0,
      insults: 0
    };

    const total = data.invites + data.insults;

    await interaction.reply({
      embeds: [{
        title: "⚠️ Strike System",
        description: `👤 User: <@${target.id}>`,
        fields: [
          { name: "🔗 Invite Strikes", value: `${data.invites}`, inline: true },
          { name: "💬 Insult Strikes", value: `${data.insults}`, inline: true },
          { name: "📊 Total", value: `${total}`, inline: true }
        ],
        timestamp: new Date()
      }]
    });
  }
};