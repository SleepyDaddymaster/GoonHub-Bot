const { getDB } = require("../services/database.service");

class InviteManager {
  constructor(client) {
    this.db = getDB();
    this.client = client;
    this.cache = new Map();
  }

  async loadInvites(guild) {
    const invites = await guild.invites.fetch();
    this.cache.set(
      guild.id,
      new Map(invites.map(i => [i.code, i.uses]))
    );
  }

  async trackJoin(member) {
    const guild = member.guild;

    const oldInvites = this.cache.get(guild.id);
    const newInvites = await guild.invites.fetch();

    let usedInvite = null;

    for (const invite of newInvites.values()) {
      const oldUses = oldInvites?.get(invite.code) || 0;

      if (invite.uses > oldUses) {
        usedInvite = invite;
        break;
      }
    }

    if (!usedInvite) return;

    const inviterId = usedInvite.inviter?.id;
    if (!inviterId) return;

    this.db.prepare(`
      INSERT INTO invites (guildId, userId, invites, leaves, fake)
      VALUES (?, ?, 1, 0, 0)
      ON CONFLICT(guildId, userId)
      DO UPDATE SET invites = invites + 1
    `).run(guild.id, inviterId);

    const updated = this.getUser(guild.id, inviterId);
    const inviterMember = await guild.members.fetch(inviterId).catch(() => null);

    if (inviterMember) {
      await this.handleRewards(inviterMember, updated.invites);
    }

    this.cache.set(
      guild.id,
      new Map(newInvites.map(i => [i.code, i.uses]))
    );
  }

  async handleRewards(member, inviteCount) {
    const guild = member.guild;
    const logChannel = guild.channels.cache.get(logChannelId);

    for (const reward of rewards) {
      const role = guild.roles.cache.get(reward.roleId);
      if (!role) continue;

      if (inviteCount >= reward.invites) {
        if (!member.roles.cache.has(role.id)) {
          await member.roles.add(role);

          if (logChannel) {
            logChannel.send({
              embeds: [{
                title: "🎉 Invite Reward",
                description: `<@${member.id}> earned a new role!`,
                fields: [
                  { name: "🎭 Role", value: role.name, inline: true },
                  { name: "📊 Invites", value: `${inviteCount}`, inline: true },
                  { name: "📈 Reason", value: `${reward.invites} Invites earned` }
                ],
                timestamp: new Date()
              }]
            });
          }
        }
      }

    }
  }

  async trackLeave(member) {
    const join = this.db.prepare(`
      SELECT * FROM invite_joins
      WHERE userId=? AND guildId=?
    `).get(member.id, member.guild.id);

    if (!join) return;

    const diff = Date.now() - join.timestamp;
    const isFake = diff < 300000;

    this.db.prepare(`
      UPDATE invites
      SET ${isFake ? "fake" : "leaves"} = ${isFake ? "fake" : "leaves"} + 1
      WHERE guildId=? AND userId=?
    `).run(member.guild.id, join.inviterId);
  }

  async getOrCreateInvite(member) {
    const guildId = member.guild.id;
    const userId = member.id;

    const existing = this.db.prepare(`
      SELECT * FROM user_invites WHERE guildId=? AND userId=?
    `).get(guildId, userId);

    if (existing && existing.inviteCode) {
      return existing.inviteCode;
    }

    const channel = member.guild.channels.cache.find(c =>
      c.isTextBased() &&
      c.viewable &&
      c.permissionsFor(member.guild.members.me).has("CreateInstantInvite")
    );

    if (!channel) {
      throw new Error("No channel found to create invite, try in another channel");
    }

    const invite = await channel.createInvite({
      maxUses: 0,
      maxAge: 0,
      unique: true
    });

    if (!invite || !invite.code) {
      throw new Error("Invite could not be created");
    }

    return invite.code;
  }

  getUser(guildId, userId) {
    return this.db.prepare(`
      SELECT * FROM invites WHERE guildId=? AND userId=?
    `).get(guildId, userId) || { invites: 0, leaves: 0, fake: 0 };
  }

  getTop(guildId) {
    return this.db.prepare(`
      SELECT * FROM invites
      WHERE guildId=?
      ORDER BY invites DESC
      LIMIT 10
    `).all(guildId);
  }

  getRank(guildId, userId) {
    const user = this.getUser(guildId, userId);

    return this.db.prepare(`
      SELECT COUNT(*) + 1 as rank
      FROM invites
      WHERE guildId=? AND invites > ?
    `).get(guildId, user.invites).rank;
  }
}

module.exports = InviteManager;
