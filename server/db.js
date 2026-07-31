import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function openDatabase(path = process.env.TEMPO_DB_PATH || "./data/tempo-pass.sqlite") {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

export function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS app_users(
      id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner','validator')), display_name TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS setup_state(id INTEGER PRIMARY KEY CHECK(id=1), owner_complete INTEGER NOT NULL DEFAULT 0, validator_complete INTEGER NOT NULL DEFAULT 0);
    INSERT OR IGNORE INTO setup_state(id) VALUES(1);
    CREATE TABLE IF NOT EXISTS entrants(
      id TEXT PRIMARY KEY, entry_reference TEXT UNIQUE NOT NULL, preferred_name TEXT NOT NULL,
      whatsapp TEXT NOT NULL, shared_code TEXT NOT NULL, tier TEXT NOT NULL, instant_prize TEXT NOT NULL,
      treat_choice TEXT, required_consent INTEGER NOT NULL, required_consent_version TEXT NOT NULL,
      required_consent_at TEXT NOT NULL, marketing_consent INTEGER NOT NULL DEFAULT 0,
      marketing_consent_version TEXT, marketing_consent_at TEXT, qr_token_hash TEXT UNIQUE NOT NULL,
      rsvp_status TEXT NOT NULL DEFAULT 'unset', party_size INTEGER NOT NULL DEFAULT 1,
      interests_json TEXT NOT NULL DEFAULT '[]', whatsapp_updates INTEGER NOT NULL DEFAULT 0,
      reminder_choice TEXT NOT NULL DEFAULT 'none', checked_in_at TEXT, checked_in_by TEXT,
      challenge_status TEXT NOT NULL DEFAULT 'not_started', challenge_rank INTEGER, awarded_prize TEXT,
      redemption_status TEXT NOT NULL DEFAULT 'unredeemed', redeemed_at TEXT, redeemed_by TEXT,
      touchbistro_check_id TEXT, gross_bill_value REAL, promotional_value REAL, customer_paid_value REAL,
      group_size INTEGER, first_visit INTEGER, is_test INTEGER NOT NULL DEFAULT 0,
      registered_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_log(
      id INTEGER PRIMARY KEY AUTOINCREMENT, actor_type TEXT NOT NULL, actor_id TEXT,
      action TEXT NOT NULL, entrant_id TEXT, detail_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES app_users(id), csrf_token TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS recovery_attempts(key_hash TEXT PRIMARY KEY, attempts INTEGER NOT NULL, window_started TEXT NOT NULL);
    INSERT OR IGNORE INTO schema_migrations(version, applied_at) VALUES(1, datetime('now'));
  `);
}
