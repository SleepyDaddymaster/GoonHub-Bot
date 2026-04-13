-- =============================
-- TICKETS
-- =============================
CREATE TABLE IF NOT EXISTS tickets (
  userId TEXT PRIMARY KEY,
  channelId TEXT
);

-- =============================
-- LEVEL SYSTEM
-- =============================
CREATE TABLE IF NOT EXISTS levels (
  userId TEXT PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 0
);

-- =============================
-- ECONOMY SYSTEM
-- =============================
CREATE TABLE IF NOT EXISTS economy (
  userId TEXT PRIMARY KEY,
  coins INTEGER DEFAULT 0
);

-- =============================
-- GIVEAWAYS (UPGRADED)
-- =============================
CREATE TABLE IF NOT EXISTS giveaways (
  id TEXT PRIMARY KEY,
  messageId TEXT,
  channelId TEXT,
  prize TEXT,
  winners INTEGER,
  endAt INTEGER
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  giveawayId TEXT,
  userId TEXT
);

-- =============================
-- MODERATION LOGS
-- =============================
CREATE TABLE IF NOT EXISTS moderation_logs (
  caseId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT,
  moderatorId TEXT,
  action TEXT,
  reason TEXT,
  timestamp INTEGER
);

-- =============================
-- 🔐 VERIFICATION SYSTEM (OAUTH)
-- =============================
CREATE TABLE IF NOT EXISTS verified_users (
    user_id TEXT PRIMARY KEY,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at BIGINT NOT NULL
);

-- =============================
-- INVITES SYSTEM (BESTEHEND)
-- =============================
CREATE TABLE IF NOT EXISTS invites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  guildId TEXT NOT NULL,
  userId TEXT NOT NULL,

  invites INTEGER DEFAULT 0,
  fake INTEGER DEFAULT 0,
  leaves INTEGER DEFAULT 0,
  bonus INTEGER DEFAULT 0,

  UNIQUE(guildId, userId)
);

-- Track wer wen eingeladen hat
CREATE TABLE IF NOT EXISTS invite_joins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  guildId TEXT NOT NULL,
  userId TEXT NOT NULL,
  inviterId TEXT NOT NULL,
  inviteCode TEXT,

  timestamp INTEGER
);

-- =============================
-- 🔥 NEU: 1 INVITE PRO USER
-- =============================
CREATE TABLE IF NOT EXISTS user_invites (
  guildId TEXT NOT NULL,
  userId TEXT NOT NULL,
  code TEXT NOT NULL,

  PRIMARY KEY (guildId, userId)
);