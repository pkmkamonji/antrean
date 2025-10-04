import Database from "better-sqlite3";
import { witaDate } from "./constants.js";

// Buat / buka database
export const db = new Database("database/mjkn.sqlite");

// Buat tabel jika belum ada
db.prepare(`
  CREATE TABLE IF NOT EXISTS configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT,
    value TEXT,
    created_at TEXT
  )
`).run();

// Buat tabel jika belum ada
db.prepare(`
  CREATE TABLE IF NOT EXISTS antrean (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nik TEXT,
    reg_date TEXT,
    queue_number TEXT
  )
`).run();

export function insertAntrean(nik, reg_date, queue_number) {
  const stmt = db.prepare("INSERT INTO antrean (nik, reg_date, queue_number) VALUES (?, ?, ?)");
  const info = stmt.run(nik, reg_date, queue_number);
  return info.lastInsertRowid;
}

export function getAntreanByNikAndDate(nik, reg_date) {
  const stmt = db.prepare("SELECT * FROM antrean WHERE nik = ? AND reg_date = ?");
  return stmt.get(nik, reg_date);
}

export function insertConfig(group_name, value, created_at = witaDate().format('YYYY-MM-DD HH:mm:ss')) {
  const stmt = db.prepare("INSERT INTO configs (group_name, value, created_at) VALUES (?, ?, ?)");
  const info = stmt.run(group_name, value, created_at);
  return info.lastInsertRowid;
}

export function updateConfig(id, value) {
  const stmt = db.prepare("UPDATE configs SET value = ?, created_at = ? WHERE id = ?");
  const info = stmt.run(value, witaDate().format('YYYY-MM-DD HH:mm:ss'), id);
  return info.changes;
}

export function getConfigByGroupName(group_name) {
  const stmt = db.prepare("SELECT * FROM configs WHERE group_name = ?");
  return stmt.get(group_name);
}

export function getAllConfigs() {
  const stmt = db.prepare("SELECT * FROM configs");
  return stmt.all();
}