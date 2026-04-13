const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("testall")
    .setDescription("Testet alle Commands")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {

    const commands = interaction.client.commands;

    let result = "🧪 Command Test:\n\n";

    for (const [name, cmd] of commands) {
      try {
        if (!cmd.execute) {
          result += `❌ ${name} → kein execute()\n`;
          continue;
        }

        result += `✅ ${name}\n`;

      } catch (err) {
        result += `❌ ${name} → Fehler\n`;
      }
    }

    await interaction.reply({
      content: result,
      ephemeral: true
    });
  }
};