const { 
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits
} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Start a giveaway setup")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 🔒 NUR ADMINS

  async execute(interaction) {

    // Extra Sicherheitscheck
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "❌ Nur Admins dürfen Giveaways starten!",
        flags: 64
      });
    }

    interaction.client.tempGiveaways.set(interaction.user.id, {
      hostId: interaction.user.id // 👤 speichern
    });

    return interaction.reply({
      content: "🎁 Starting giveaway setup...\nUse the buttons:",
      components: [{
        type: 1,
        components: [
          { type: 2, label: "Prize", style: 1, custom_id: "gw_set_prize" },
          { type: 2, label: "Time", style: 1, custom_id: "gw_set_time" },
          { type: 2, label: "Winners", style: 1, custom_id: "gw_set_winner" },
          { type: 2, label: "Start", style: 3, custom_id: "gw_start" }
        ]
      }],
      flags: 64
    });
  }
};