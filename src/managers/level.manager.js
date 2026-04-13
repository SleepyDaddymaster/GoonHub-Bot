const { db } = require("../services/database.service");

class LevelManager {
  get(userId) {
    let user = db.prepare("SELECT * FROM levels WHERE userId=?")
      .get(userId);

    if (!user) {
      db.prepare("INSERT INTO levels VALUES (?, ?, ?)")
        .run(userId, 0, 0);
      user = { xp: 0, level: 0 };
    }

    return user;
  }

  addXP(userId, amount) {
    const user = this.get(userId);

    user.xp += amount;

    if (user.xp >= 100) {
      user.level++;
      user.xp = 0;
    }

    db.prepare("UPDATE levels SET xp=?, level=? WHERE userId=?")
      .run(user.xp, user.level, userId);

    return user;
  }
}

module.exports = new LevelManager();