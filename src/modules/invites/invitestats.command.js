const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invitestats")
    .setDescription("Show Invite Statistics")
    .addUserOption(opt =>
      opt.setName("user")
        .setDescription("Pick a user to check their invite stats")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    try {
      const target = interaction.options.getUser("user") || interaction.user;

      const stats = client.managers.invite.getUser(
        interaction.guild.id,
        target.id
      );

      const rank = client.managers.invite.getRank(
        interaction.guild.id,
        target.id
      );

      const net = stats.invites - stats.leaves - stats.fake;

      const embed = new EmbedBuilder()
        .setTitle("📊 Invite Stats")
        .setColor("#a855f7") // 💜 Lila
        .setThumbnail(target.displayAvatarURL({ dynamic: true }))
        .addFields(
          {
            name: "👤 User",
            value: `<@${target.id}>`,
            inline: true
          },
          {
            name: "🏆 Rank",
            value: `#${rank}`,
            inline: true
          },
          {
            name: "📥 Invites",
            value: `\`${stats.invites}\``,
            inline: true
          },
          {
            name: "📤 Leaves",
            value: `\`${stats.leaves}\``,
            inline: true
          },
          {
            name: "⚠️ Fake",
            value: `\`${stats.fake}\``,
            inline: true
          },
          {
            name: "📊 Actual Invites",
            value: `\`${net}\``,
            inline: true
          }
        )
        .setFooter({ text: `Server: ${interaction.guild.name}` })
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });

    } catch (err) {
      console.error("INVITESTATS ERROR:", err);

      return interaction.reply({
        content: "❌ error fetching invite stats",
        flags: 64
      });
    }
  }
};