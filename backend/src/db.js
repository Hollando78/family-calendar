import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import config from './config.js';

const dbDir = path.dirname(config.databasePath);
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(config.databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    color TEXT,
    push_subscription TEXT
  );`,
  `CREATE TABLE IF NOT EXISTS families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    join_code TEXT UNIQUE NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(family_id, user_id),
    FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_id INTEGER NOT NULL,
    created_by INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT,
    repeat_rule TEXT,
    all_day INTEGER DEFAULT 0,
    member_id INTEGER,
    location TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(family_id) REFERENCES families(id) ON DELETE CASCADE,
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(member_id) REFERENCES users(id) ON DELETE SET NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_events_family_date ON events(family_id, date);`
];

migrations.forEach((sql) => db.exec(sql));

export default db;
