module.exports = {
  name: "guildMemberRemove",

  async execute(member, client) {
    client.managers.invite.handleLeave(
      member.guild.id,
      member.id
    );
  }
};