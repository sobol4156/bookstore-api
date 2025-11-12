import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Get values from .env with fallback to default values
const CONTAINER_NAME = process.env.POSTGRES_CONTAINER_NAME || "";
const DB_USER = process.env.POSTGRES_USER || "";
const DB_NAME = process.env.POSTGRES_DB || "";
const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || "");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const date = new Date()
  .toISOString()
  .replace(/T/, "_")
  .replace(/:/g, "-")
  .split(".")[0];
const backupFile = path.join(BACKUP_DIR, `backup_${date}.sql`);

// Backup command
const command = `docker exec -t ${CONTAINER_NAME} pg_dump -U ${DB_USER} -d ${DB_NAME} > "${backupFile}"`;

console.log(`Creating database backup: ${backupFile}`);
console.log(`Container: ${CONTAINER_NAME}`);
console.log(`User: ${DB_USER}`);
console.log(`Database: ${DB_NAME}`);

try {
  execSync(command, { 
    stdio: "inherit", 
    shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" 
  });
  console.log("Backup created successfully!");
} catch (err) {
  console.error("Error: Failed to create backup:", (err as Error).message);
  process.exit(1);
}