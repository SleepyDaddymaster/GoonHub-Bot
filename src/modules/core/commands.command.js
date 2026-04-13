const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("commands")
    .setDescription("ℹ️ Shows all available commands"),

  async execute(interaction) {

    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      return interaction.reply({
        content: "❌ No commands found",
        flags: 64
      });
    }

    // 📦 Kategorien bauen
    const categories = {};

    for (const [name, cmd] of commands) {
      const category = cmd.category || "Others";

      if (!categories[category]) categories[category] = [];

      categories[category].push({
        name: cmd.data.name,
        description: cmd.data.description
      });
    }

    // 🎨 Embed
    const embed = new EmbedBuilder()
      .setTitle("📜 All Commands")
      .setColor("#5865F2")
      .setDescription("Here are all available commands:");

    for (const cat in categories) {
      const value = categories[cat]
        .map(c => `</${c.name}:0> - ${c.description}`)
        .join("\n");

      embed.addFields({
        name: `📂 ${cat}`,
        value: value || "No commands"
      });
    }

    interaction.reply({
      embeds: [embed],
      flags: 64
    });
  }
};