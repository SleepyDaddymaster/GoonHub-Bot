const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const modulesPath = path.join(__dirname, "../modules");
  const modules = fs.readdirSync(modulesPath);

  for (const m of modules) {
    const files = fs.readdirSync(path.join(modulesPath, m))
      .filter(f => f.endsWith(".command.js"));

    for (const file of files) {
      const cmd = require(path.join(modulesPath, m, file));

      if (!cmd || !cmd.data || !cmd.execute) continue;

      client.commands.set(cmd.data.name, cmd);
    }
  }
};
