import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const sourcePath = process.env.TEMPO_DB_PATH;
const backupDir = process.env.TEMPO_BACKUP_DIR;

if (!sourcePath || !backupDir) {
  throw new Error("TEMPO_DB_PATH and TEMPO_BACKUP_DIR are required.");
}

mkdirSync(backupDir, { recursive: true });
const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const backupPath = join(backupDir, `tempo-pass-${stamp}.sqlite`);
const source = new Database(sourcePath);
await source.backup(backupPath);
source.close();

const backup = new Database(backupPath, { readonly: true });
const integrity = backup.pragma("integrity_check", { simple: true });
backup.close();
if (integrity !== "ok") throw new Error(`Backup integrity failed: ${integrity}`);

console.log(backupPath);
