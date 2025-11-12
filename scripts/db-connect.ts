import * as dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

// Get values from .env with fallback to default values
const CONTAINER_NAME = process.env.POSTGRES_CONTAINER_NAME || "";
const DB_USER = process.env.POSTGRES_USER || "";
const DB_NAME = process.env.POSTGRES_DB || "";

console.log(`Connecting to database...`);
console.log(`Container: ${CONTAINER_NAME}`);
console.log(`User: ${DB_USER}`);
console.log(`Database: ${DB_NAME}`);
console.log();

// Execute psql command
import { execSync } from "child_process";
execSync(
  `docker exec -it ${CONTAINER_NAME} psql -U ${DB_USER} -d ${DB_NAME}`,
  { stdio: "inherit", shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh" }
);