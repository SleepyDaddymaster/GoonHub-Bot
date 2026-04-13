module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    if (!member.client.managers?.invite) return;

    await member.client.managers.invite.trackJoin(member);
  }
};