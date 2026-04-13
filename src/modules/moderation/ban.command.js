const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bannt einen User vom Server")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Der User der gebannt werden soll")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reason")
        .setDescription("Grund für den Ban")
        .setRequired(false)
    ),

  async execute(interaction) {
    // 🔒 Permission Check
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: "❌ Du hast keine Berechtigung dafür!",
        ephemeral: true
      });
    }

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Kein Grund angegeben";

    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "❌ User nicht gefunden!",
        ephemeral: true
      });
    }

    // ❗ Sicherheitscheck (keine höheren Rollen bannen)
    if (member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: "❌ Du kannst diesen User nicht bannen!",
        ephemeral: true
      });
    }

    try {
      await member.ban({ reason });

      await interaction.reply({
        content: `🔨 ${user.tag} wurde gebannt\n📄 Grund: ${reason}`
      });

    } catch (err) {
      console.error(err);

      interaction.reply({
        content: "❌ Fehler beim Bannen!",
        ephemeral: true
      });
    }
  }
};