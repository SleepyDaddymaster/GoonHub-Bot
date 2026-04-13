class CooldownService {
  constructor() {
    this.cooldowns = new Map();
  }

  check(userId, command, time) {
    const key = `${userId}_${command}`;

    if (this.cooldowns.has(key)) {
      const expire = this.cooldowns.get(key);

      if (Date.now() < expire) {
        return expire - Date.now();
      }
    }

    this.cooldowns.set(key, Date.now() + time);
    return 0;
  }
}

module.exports = new CooldownService();