module.exports = {
  name: "guildMemberAdd",
  execute(client, member) {
    const channel = member.guild.systemChannel;
    if (!channel) return;

    channel.send(`👋 Willkommen ${member}`);
  }
};