const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get your personal invite link"),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // 🔥 Invite vom Manager holen
      const code = await client.managers.invite.getOrCreateInvite(
        interaction.member
      );

      // ❌ Falls nichts zurückkommt
      if (!code || typeof code !== "string") {
        throw new Error("Invite Code could not be generated!");
      }

      const inviteLink = `https://discord.gg/${code}`;

      // 📩 Versuch DM zu senden
      let dmSuccess = true;
      await interaction.user.send(
        `🎉 Your Personal Invite Link:\n${inviteLink}`
      ).catch(() => {
        dmSuccess = false;
      });

      // ✅ Antwort
      return interaction.editReply({
        content: dmSuccess
          ? `✅ Here is your personal Invite Link: ${inviteLink}\nInvite Link was also sent to you per DM! - You can see your invites with /invitestats!`
          : `⚠️ Could not send DM!\nHere is your link:\n${inviteLink}`
      });

    } catch (err) {
      console.error("INVITE ERROR FULL:", err);

      return interaction.editReply({
        content: `❌ Error creating invite:\n${err.message}`
      });
    }
  }
};