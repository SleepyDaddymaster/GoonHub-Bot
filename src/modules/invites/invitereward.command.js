const { SlashCommandBuilder } = require("discord.js");
const { rewards } = require("./inviteRewards");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invitereward")
    .setDescription("show your invite reward progress")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Pick a user to check their invite rewards")
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const target = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(target.id);

    const inviteManager = client.inviteManager;
    const data = inviteManager.getUser(interaction.guild.id, target.id);

    const inviteCount = data.invites;

    const sorted = [...rewards].sort((a, b) => a.invites - b.invites);

    let currentReward = null;
    for (const reward of sorted) {
      if (inviteCount >= reward.invites) {
        currentReward = reward;
      }
    }

    let nextReward = sorted.find(r => inviteCount < r.invites);

    const currentRole = currentReward
      ? `<@&${currentReward.roleId}>`
      : "None";

    const nextRole = nextReward
      ? `<@&${nextReward.roleId}>`
      : "Max Level reached";

    const remaining = nextReward
      ? nextReward.invites - inviteCount
      : 0;

    await interaction.reply({
      embeds: [{
        title: "🎟️ Invite Reward Stats",
        description: `👤 User: <@${target.id}>`,
        fields: [
          { name: "📊 Invites", value: `${inviteCount}`, inline: true },
          { name: "🏆 Current Role", value: currentRole, inline: true },
          { name: "🎯 Next Role", value: nextRole, inline: true },
          {
            name: "⏳ Progress",
            value: nextReward
              ? `**${remaining} Invites** Remaining for the next role`
              : "You have reached the maximum level 🎉"
          }
        ],
        timestamp: new Date()
      }]
    });
  }
};
