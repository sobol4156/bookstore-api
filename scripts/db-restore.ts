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

// Get backup file name from command line arguments
const backupFileName = process.argv[2];

if (!backupFileName) {
  console.error("Error: Please specify backup file name!");
  console.log("Usage: pnpm run db:restore <backup_file_name>");
  console.log("Example: pnpm run db:restore backup_2025-11-12_20-17-27.sql");
  console.log("\nAvailable backups:");
  
  if (fs.existsSync(BACKUP_DIR)) {
    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => {
        const statA = fs.statSync(path.join(BACKUP_DIR, a));
        const statB = fs.statSync(path.join(BACKUP_DIR, b));
        return statB.mtimeMs - statA.mtimeMs;
      });
    
    if (backups.length > 0) {
      backups.forEach((file, index) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString('en-US');
        console.log(`  ${index + 1}. ${file} (${size} KB, ${date})`);
      });
    } else {
      console.log("  No backups found");
    }
  } else {
    console.log("  Backups directory does not exist");
  }
  
  process.exit(1);
}

const backupFile = path.join(BACKUP_DIR, backupFileName);

if (!fs.existsSync(backupFile)) {
  console.error(`Error: Backup file not found: ${backupFile}`);
  process.exit(1);
}

console.log(`Dropping existing database: ${DB_NAME}...`);
try {
  execSync(
    `docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -c "DROP DATABASE IF EXISTS ${DB_NAME};"`,
    { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
  );
} catch (err) {
  console.error("Warning: Error while dropping database:", (err as Error).message);
}

console.log(`Creating new database: ${DB_NAME}...`);
try {
  execSync(
    `docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME};"`,
    { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
  );
} catch (err) {
  console.error("Error: Failed to create database:", (err as Error).message);
  process.exit(1);
}

console.log(`Restoring from backup: ${backupFileName}`);
console.log(`Container: ${CONTAINER_NAME}`);
console.log(`User: ${DB_USER}`);
console.log(`Database: ${DB_NAME}`);

try {
  // Copy backup file to container and restore from there
  const tempBackupPath = `/tmp/${backupFileName}`;
  
  console.log("Copying backup file to container...");
  execSync(
    `docker cp "${backupFile}" ${CONTAINER_NAME}:${tempBackupPath}`,
    { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
  );
  
  console.log("Restoring database...");
  execSync(
    `docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -f ${tempBackupPath}`,
    { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
  );
  
  // Clean up temporary file
  console.log("Cleaning up...");
  execSync(
    `docker exec -i ${CONTAINER_NAME} rm ${tempBackupPath}`,
    { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
  );
  
  console.log("Restore completed successfully!");
  
  // Check tables
  console.log("Checking tables...");
  execSync(
    `docker exec -i ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME} -c "\\dt"`,
    { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
  );
} catch (err) {
  console.error("Error: Failed to restore:", (err as Error).message);
  process.exit(1);
}