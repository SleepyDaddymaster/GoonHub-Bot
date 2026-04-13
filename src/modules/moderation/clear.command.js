const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Löscht Nachrichten")
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("Anzahl")
        .setRequired(true)
    ),

  async execute(i) {
    if (!i.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return i.reply({ content: "❌ Keine Rechte", ephemeral: true });
    }

    const amount = i.options.getInteger("amount");

    await i.channel.bulkDelete(amount);

    i.reply({ content: `🧹 ${amount} gelöscht`, ephemeral: true });
  }
};