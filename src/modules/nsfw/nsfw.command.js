const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("NSFW check"),

  async execute(i) {
    if (!i.channel.nsfw) {
      return i.reply({ content: "❌ Not NSFW", ephemeral: true });
    }

    i.reply("🔞 Allowed");
  }
};