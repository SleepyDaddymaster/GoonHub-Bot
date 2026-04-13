const fs = require("fs");

function getGuildConfig(id) {
  const path = `./src/config/guilds/${id}.json`;

  if (!fs.existsSync(path)) {
    return require("../config/default.json");
  }

  return JSON.parse(fs.readFileSync(path));
}

module.exports = { getGuildConfig };