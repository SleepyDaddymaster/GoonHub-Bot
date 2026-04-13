module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    if (!member.client.managers?.invite) return;

    await member.client.managers.invite.trackLeave(member);
  }
};