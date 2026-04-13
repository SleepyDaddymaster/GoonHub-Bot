const {
  SlashCommandBuilder,
  ActionRowBuilder,
  RoleSelectMenuBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Create a role panel"),

  async execute(interaction) {

    const menu = new RoleSelectMenuBuilder()
      .setCustomId("rr_create")
      .setPlaceholder("Choose roles")
      .setMinValues(1)
      .setMaxValues(10);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: "Choose the roles:",
      components: [row],
      ephemeral: true
    });
  }
};