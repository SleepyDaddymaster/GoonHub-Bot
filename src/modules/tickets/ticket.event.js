const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const db = require("../../services/database.service");

module.exports = {
  name: "interactionCreate",

  async execute(client, interaction) {

    if (!interaction.isButton()) return;

    // 🎫 OPEN TICKET
    if (interaction.customId === "ticket_open") {

      const existing = db.getTicket(interaction.user.id);

      if (existing) {
        return interaction.reply({
          content: "❌ You already have an open ticket!",
          ephemeral: true
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      db.createTicket(interaction.user.id, channel.id);

      const closeBtn = new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("🔒 Close")
        .setStyle(ButtonStyle.Danger);

      await channel.send({
        content: `🎫 Ticket from ${interaction.user}`,
        components: [new ActionRowBuilder().addComponents(closeBtn)]
      });

      interaction.reply({
        content: `✅ Ticket created: ${channel}`,
        ephemeral: true
      });
    }

    // 🔒 CLOSE
    if (interaction.customId === "ticket_close") {

      const ticket = db.getTicketByChannel(interaction.channel.id);
      if (!ticket) return;

      db.deleteTicket(ticket.userId);

      await interaction.channel.delete();
    }
  }
};