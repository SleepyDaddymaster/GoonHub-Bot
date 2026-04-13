module.exports = {
  name: "guildMemberAdd",

  async execute(member, client) {
    const invites = await member.guild.invites.fetch();

    const used = invites.find(i => i.uses > 0);
    if (!used) return;

    const data = client.managers.invite.getInviteOwner(
      member.guild.id,
      used.code
    );

    if (!data) return;

    client.managers.invite.addInvite(
      member.guild.id,
      data.userId,
      member.id
    );

    // OPTIONAL DM
    try {
      member.send(`🎉 Du wurdest von <@${data.userId}> eingeladen!`);
    } catch {}
  }
};