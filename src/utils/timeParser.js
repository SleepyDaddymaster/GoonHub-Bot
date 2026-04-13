function parseTime(input) {
  const regex = /(\d+)([smhd])/g;
  let total = 0;
  let match;

  while ((match = regex.exec(input))) {
    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === "s") total += value * 1000;
    if (unit === "m") total += value * 60 * 1000;
    if (unit === "h") total += value * 60 * 60 * 1000;
    if (unit === "d") total += value * 24 * 60 * 60 * 1000;
  }

  if (!total) throw new Error("Invalid time format");

  return {
    ms: total,
    timestamp: Date.now() + total
  };
}

module.exports = { parseTime };