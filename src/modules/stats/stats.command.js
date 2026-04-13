const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Server stats"),

  async execute(i) {
    i.reply(`👥 Members: ${i.guild.memberCount}`);
  }
};