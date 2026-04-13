require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");

// 🔥 NEU
const express = require("express");
const axios = require("axios");

// 🔥 DEIN DB SERVICE EINBINDEN
const db = require("./src/services/database.service");

// ==============================
// COMMANDS LADEN
// ==============================

const commands = [];

const modules = fs.readdirSync("./src/modules");

for (const m of modules) {
  const files = fs.readdirSync(`./src/modules/${m}`);

  for (const file of files) {
    if (!file.endsWith(".command.js")) continue;

    const cmd = require(`./src/modules/${m}/${file}`);

    if (!cmd.data) {
      console.log(`❌ Übersprungen: ${file}`);
      continue;
    }

    commands.push(cmd.data.toJSON());
  }
}

// ==============================
// COMMANDS DEPLOYEN
// ==============================

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  );

  console.log("✅ Commands deployed");
})();

// ==============================
// 🌐 EXPRESS OAUTH SERVER
// ==============================

const app = express();

app.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) return res.send("❌ Kein Code erhalten");

    // 🔁 TOKEN HOLEN
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // 👤 USER HOLEN
    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const user = userRes.data;

    // 💾 IN DB SPEICHERN
    await db.query(
      `
      INSERT INTO verified_users (user_id, access_token, refresh_token, expires_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
      access_token=excluded.access_token,
      refresh_token=excluded.refresh_token,
      expires_at=excluded.expires_at
    `,
      [
        user.id,
        access_token,
        refresh_token,
        Date.now() + expires_in * 1000
      ]
    );

    console.log(`✅ User verifiziert: ${user.id}`);

    res.send("✅ Du bist jetzt verifiziert! Du kannst das Fenster schließen.");
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.send("❌ Fehler bei der Verifizierung");
  }
});

// 🚀 SERVER START
app.listen(3000, () => {
  console.log("🌐 OAuth Server läuft auf Port 3000");
});