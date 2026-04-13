const warnings = new Map();

module.exports = {
  async run(msg, client) {
    try {
      if (!msg.guild || msg.author.bot) return;

      // ❗ FIX: member kann null sein
      if (!msg.member) return;

      // ✅ Admin Bypass
      if (msg.member.permissions.has("Administrator")) return;

      const userId = msg.author.id;

      const config = {
        maxWarnings: 3,
        timeout: 10 * 60 * 1000
      };

      // 🧠 NORMALIZE
      const normalize = (text) => {
        return text
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .replace(/1/g, "i")
          .replace(/3/g, "e")
          .replace(/0/g, "o")
          .replace(/4/g, "a")
          .replace(/5/g, "s");
      };

      const content = msg.content.toLowerCase();
      const normalized = normalize(msg.content);

      // 🚫 INVITES
      if (/(discord\.gg|discord\.com\/invite)/.test(content)) {
        console.log("Invite erkannt");
        return this.punish(msg, userId, "invite", "Discord Invite", config, client);
      }

      // 🤬 WORDS
      const bannedWords = [
        "nigga", "whore", "bitch", "son of a bitch",
        "hure", "hurensohn", "bastard", "Nuttensohn",
        "nutte", "wixxer", "nigger", "niggers", "niga", "negro", "hitler", "heil" ,"heil hitler", "Children", "bio", "my bio", "cp", "pizza", "children",
      ];

      // 🔤 PATTERNS
      const bannedPatterns = [
        /n+i+g*g+a+/i,
        /b+i+t+c+h+/i,
        /h+u+r+e+/i,
        /b+a+s+t+a+r+d+/i,
        /n+u+t+t+e+/i
      ];

      // ❗ FIX: BOTH content + normalized checken
      const wordMatch = bannedWords.some(word =>
        content.includes(word) || normalized.includes(word)
      );

      const patternMatch = bannedPatterns.some(pattern =>
        pattern.test(content)
      );

      if (wordMatch || patternMatch) {
        console.log("Insult recognized:", msg.content);

        return this.punish(
          msg,
          userId,
          "insult",
          "Inappropriate Language/Insulting",
          config,
          client
        );
      }

      // 🔊 CAPS SPAM
      if (msg.content.length > 10) {
        const upper = msg.content.replace(/[^A-Z]/g, "").length;
        const ratio = upper / msg.content.length;

        if (ratio > 0.7) {
          console.log("Caps Spam recognized");

          return this.punish(
            msg,
            userId,
            "caps",
            "Excessive Caps",
            config,
            client
          );
        }
      }

    } catch (err) {
      console.log("AutoMod Error:", err);
    }
  },

  async punish(msg, userId, type, reason, config, client) {
    try {
      const db = client.inviteManager?.db;

      // ❗ FIX: delete safe
      try {
        await msg.delete();
      } catch (e) {
        console.log("Delete Error:", e.message);
      }

      // ⚠️ WARNINGS
      if (!warnings.has(userId)) warnings.set(userId, 0);
      warnings.set(userId, warnings.get(userId) + 1);

      const strikes = warnings.get(userId);

      const warnMsg = await msg.channel.send(
        `⚠️ ${msg.author} | ${reason} (${strikes}/${config.maxWarnings})\n-# AutoMod - Stop sending inappropriate messages, invites or insults!`
      );

      setTimeout(() => warnMsg.delete().catch(() => {}), 4000);

      // ❗ FIX: DB optional machen (falls undefined → kein crash)
      if (db) {
        if (type === "invite") {
          db.prepare(`
            INSERT INTO strikes (guildId, userId, invites, insults)
            VALUES (?, ?, 1, 0)
            ON CONFLICT(guildId, userId)
            DO UPDATE SET invites = invites + 1
          `).run(msg.guild.id, msg.author.id);
        }

        if (type === "insult" || type === "caps") {
          db.prepare(`
            INSERT INTO strikes (guildId, userId, invites, insults)
            VALUES (?, ?, 0, 1)
            ON CONFLICT(guildId, userId)
            DO UPDATE SET insults = insults + 1
          `).run(msg.guild.id, msg.author.id);
        }
      }

      // 🔇 TIMEOUT
      if (strikes >= config.maxWarnings) {
        try {
          await msg.member.timeout(config.timeout, "AutoMod");

          const timeoutMsg = await msg.channel.send(
            `🔇 ${msg.author} has been timeouted for ${config.timeout / 60000} minutes!\n-# AutoMod - You should have stopped! xD`
          );

          setTimeout(() => timeoutMsg.delete().catch(() => {}), 5000);

          warnings.set(userId, 0);
        } catch (err) {
          console.log("Timeout Error:", err.message);
        }
      }

      // 📊 LOGGING
      const logChannel = msg.guild.channels.cache.find(
        c => c.name === "logs" && c.isTextBased()
      );

      if (logChannel) {
        logChannel.send({
          embeds: [{
            title: "📊 AutoMod Log",
            fields: [
              { name: "User", value: msg.author.tag, inline: true },
              { name: "Reason", value: reason, inline: true },
              { name: "Strikes", value: `${strikes}`, inline: true }
            ],
            timestamp: new Date()
          }]
        }).catch(() => {});
      }

    } catch (err) {
      console.log("Punish Error:", err);
    }
  }
};