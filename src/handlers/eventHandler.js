const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  const eventsPath = path.join(__dirname, "events");
  const files = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const event = require(path.join(eventsPath, file));

    if (!event.name || !event.execute) {
      console.log(`❌ Übersprungen: ${file}`);
      continue;
    }

    console.log("Loaded event:", file);

    client.on(event.name, (...args) => {
event.execute(...args, client);
    });
  }
};