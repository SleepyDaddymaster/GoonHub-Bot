const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Create a ticket panel"),

  async execute(i) {

    const embed = new EmbedBuilder()
      .setTitle("🎫 Tickets")
      .setDescription("Choose a category to create a ticket")
      .setColor("Purple");

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_create")
      .setPlaceholder("Ticket auswählen")
      .addOptions([
        { label: "Support", value: "support" },
        { label: "Report", value: "report" },
        { label: "Bug", value: "bug" }
      ]);

    const row1 = new ActionRowBuilder().addComponents(menu);

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("panel_settings")
        .setEmoji("⚙️")
        .setStyle(ButtonStyle.Secondary)
    );

    await i.reply({
      embeds: [embed],
      components: [row1, row2]
    });
  }
};