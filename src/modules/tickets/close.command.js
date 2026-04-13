const { SlashCommandBuilder } = require("discord.js");
const tickets = require("../../managers/ticket.manager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Close ticket"),

  async execute(i) {
    const t = tickets.getByChannel(i.channel.id);
    if (!t) return;

    tickets.delete(t.userId);
    await i.channel.delete();
  }
};