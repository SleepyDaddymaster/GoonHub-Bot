class Formatter {

  static formatTime(ms) {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / (1000 * 60)) % 60;
    const hours = Math.floor(ms / (1000 * 60 * 60));

    return `${hours}h ${minutes}m ${seconds}s`;
  }

  static formatNumber(num) {
    return num.toLocaleString("de-DE");
  }

  static discordTimestamp(timestamp) {
    return `<t:${Math.floor(timestamp / 1000)}:R>`;
  }

  static truncate(text, length = 100) {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
  }
}

module.exports = Formatter;