const Database = require("better-sqlite3");

let db;

function init() {
  const dbPath = process.env.DATABASE_PATH || "./database.sqlite";
  db = new Database(dbPath);

  // =============================
  // 🔐 VERIFICATION SYSTEM (NEU)
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS verified_users (
      user_id TEXT PRIMARY KEY,
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    )
  `).run();

  // =============================
  // 🎫 TICKETS
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT,
      userId TEXT,
      channelId TEXT,
      type TEXT,
      claimedBy TEXT,
      createdAt INTEGER
    )
  `).run();

  db.prepare(`
    CREATE TABLE IF NOT EXISTS strikes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT,
      userId TEXT,
      invites INTEGER DEFAULT 0,
      insults INTEGER DEFAULT 0,
      UNIQUE(guildId, userId)
    );
  `).run();

  // =============================
  // 🎭 REACTION ROLES
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS reaction_roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT,
      messageId TEXT,
      roleId TEXT,
      customId TEXT
    )
  `).run();

  // =============================
  // 🎁 GIVEAWAYS
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS giveaways (
      id TEXT PRIMARY KEY,
      messageId TEXT,
      channelId TEXT,
      prize TEXT,
      winners INTEGER,
      endAt INTEGER,
      hostId TEXT,
      ended INTEGER DEFAULT 0
    )
  `).run();

  try {
    db.prepare(`ALTER TABLE giveaways ADD COLUMN hostId TEXT`).run();
  } catch {}

  // =============================
  // 🎁 GIVEAWAY ENTRIES
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS giveaway_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      giveawayId TEXT,
      userId TEXT
    )
  `).run();

  // =============================
  // 📈 LEVEL SYSTEM
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS levels (
      userId TEXT PRIMARY KEY,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0
    )
  `).run();

  // =============================
  // 💰 ECONOMY
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS economy (
      userId TEXT PRIMARY KEY,
      coins INTEGER DEFAULT 0
    )
  `).run();

  // =============================
  // 📨 INVITES
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT NOT NULL,
      userId TEXT NOT NULL,
      invites INTEGER DEFAULT 0,
      fake INTEGER DEFAULT 0,
      leaves INTEGER DEFAULT 0,
      bonus INTEGER DEFAULT 0,
      UNIQUE(guildId, userId)
    )
  `).run();

  // =============================
  // 📨 INVITE JOINS
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS invite_joins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT NOT NULL,
      userId TEXT NOT NULL,
      inviterId TEXT NOT NULL,
      inviteCode TEXT,
      timestamp INTEGER
    )
  `).run();

  // =============================
  // 🔗 USER INVITES
  // =============================
  db.prepare(`
    CREATE TABLE IF NOT EXISTS user_invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guildId TEXT NOT NULL,
      userId TEXT NOT NULL,
      inviteCode TEXT NOT NULL,
      uses INTEGER DEFAULT 0,
      UNIQUE(guildId, inviteCode)
    )
  `).run();

  console.log("✅ Database fully ready (ALL SYSTEMS)");
}

// 🔥 WICHTIG: DIREKT DB EXPORTIEREN
function getDB() {
  if (!db) init();
  return db;
}

// 🔥 MAGIC FIX → erlaubt require(...).prepare()
module.exports = { getDB };
