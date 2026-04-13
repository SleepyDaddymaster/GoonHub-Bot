const { getDB } = require("../../services/database.service");

function getNeededXP(level) {
  return Math.floor(100 * Math.pow(1.5, level));
}

module.exports = {
  name: "level",
  
  async run(msg) {

    if (msg.author.bot) return;

    const db = getDB(); // 🔥 WICHTIG

    let user = db.prepare("SELECT * FROM levels WHERE userId=?")
      .get(msg.author.id);

    // =========================
    // 🆕 USER ERSTELLEN
    // =========================
    if (!user) {
      db.prepare(`
        INSERT INTO levels (userId, xp, level)
        VALUES (?, ?, ?)
      `).run(msg.author.id, 0, 0);

      user = { xp: 0, level: 0 };
    }

    // =========================
    // ⚡ XP GAIN
    // =========================
    const xpGain = Math.floor(Math.random() * 11) + 10; // 10–20 XP
    user.xp += xpGain;

    let neededXP = getNeededXP(user.level);

    // =========================
    // 📈 LEVEL UP LOOP
    // =========================
    let leveledUp = false;

    while (user.xp >= neededXP) {
      user.xp -= neededXP;
      user.level++;
      neededXP = getNeededXP(user.level);
      leveledUp = true;
    }

    // =========================
    // 🎉 LEVEL UP MESSAGE
    // =========================
    if (leveledUp) {
      await msg.channel.send({
        embeds: [
          {
            title: "🎉 Level Up!",
            description: `${msg.author} ist jetzt **Level ${user.level}**!`,
            color: 0x00FF99,
            fields: [
              {
                name: "📈 Fortschritt",
                value: `${user.xp}/${neededXP} XP`,
                inline: true
              },
              {
                name: "⚡ XP erhalten",
                value: `+${xpGain} XP`,
                inline: true
              }
            ],
            footer: {
              text: "Weiter so 🚀"
            },
            timestamp: new Date()
          }
        ]
      });
    }

    // =========================
    // 💾 SAVE
    // =========================
    db.prepare(`
      UPDATE levels SET xp=?, level=? WHERE userId=?
    `).run(user.xp, user.level, msg.author.id);
  }
};