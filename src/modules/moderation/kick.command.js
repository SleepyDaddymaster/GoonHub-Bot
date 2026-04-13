const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kickt einen User")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Der User")
        .setRequired(true)
    ),

  async execute(i) {
    if (!i.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return i.reply({ content: "❌ Keine Rechte", ephemeral: true });
    }

    const user = i.options.getUser("user");
    const member = i.guild.members.cache.get(user.id);

    await member.kick();

    i.reply(`👢 ${user.tag} wurde gekickt`);
  }
};