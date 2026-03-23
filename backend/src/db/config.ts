import Database from 'best-sqlite3';
import os from 'os';
import path from 'path';
import fs from 'fs';

const configDir = path.join(os.homedir(), '.minihands');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

const dbPath = path.join(configDir, 'config.db');
let db: any;

export async function initDB() {
  if (db) return;
  
  // Connect returns an instance asynchronously as WASM loads
  db = await (Database as any).connect(dbPath);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
}

export function getConfig(key: string): string | null {
  if (!db) throw new Error("DB not initialized. Call initDB() first.");
  const rows = db.exec('SELECT value FROM config WHERE key = $key', { key });
  return rows.length > 0 ? rows[0].value : null;
}

export function setConfig(key: string, value: string): void {
  if (!db) throw new Error("DB not initialized. Call initDB() first.");
  db.run('INSERT INTO config (key, value) VALUES ($key, $val) ON CONFLICT(key) DO UPDATE SET value=excluded.value', { key, val: value });
}

export function getAllConfig(): Record<string, string> {
  if (!db) throw new Error("DB not initialized. Call initDB() first.");
  const rows = db.exec('SELECT key, value FROM config');
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
