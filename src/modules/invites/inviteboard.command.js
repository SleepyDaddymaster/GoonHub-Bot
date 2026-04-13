const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inviteboard")
    .setDescription("Top Invite Leaderboard"),

  async execute(interaction, client) {
    await interaction.deferReply();

    try {
      const raw = client.managers.invite.getTop(interaction.guild.id);

      if (!raw || !raw.length) {
        return interaction.editReply({
          content: "❌ No data available!"
        });
      }

      // 🔥 Bots rausfiltern + User fetchen
      const filtered = [];

      for (const entry of raw) {
        try {
          const user = await client.users.fetch(entry.userId);

          if (user.bot) continue; // ❌ Bots skippen

          filtered.push({
            ...entry,
            username: user.username
          });
        } catch {
          continue;
        }
      }

      if (!filtered.length) {
        return interaction.editReply({
          content: "❌ No valid user data found!"
        });
      }

      // 🔥 Top 10 nach Filter
      const top = filtered.slice(0, 10);

      const leaderboard = top.map((u, i) => {
        const medal =
          i === 0 ? "🥇" :
          i === 1 ? "🥈" :
          i === 2 ? "🥉" :
          `#${i + 1}`;

        const net = u.invites - u.leaves - u.fake;

        return `${medal} <@${u.userId}>
┗ 📥 Invites: \`${u.invites}\`
┗ 📉 Actual Invites: \`${net}\`
┗ 📤 Leaves: \`${u.leaves}\`
┗ ⚠️ Fake: \`${u.fake}\``;
      }).join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("🏆 Invite Leaderboard")
        .setDescription(leaderboard)
        .setColor("#a855f7") // 💜 Lila
        .setFooter({ text: `Server: ${interaction.guild.name}` })
        .setTimestamp();

      return interaction.editReply({
        embeds: [embed]
      });

    } catch (err) {
      console.error("INVITEBOARD ERROR:", err);

      return interaction.editReply({
        content: "❌ Fehler beim Laden des Leaderboards!"
      });
    }
  }
};