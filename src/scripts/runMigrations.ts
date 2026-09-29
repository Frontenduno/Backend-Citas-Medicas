import dotenv from "dotenv";
import mysql, { Connection } from "mysql2/promise";
import fs from "fs/promises";
import path from "path";

dotenv.config();

const MIGRATIONS_DIR = path.join(__dirname, "..", "..", "migrations");
const MIGRATION_PATTERN = /^\d+_.*\.sql$/;

async function getMigrationFiles(): Promise<string[]> {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files
    .filter((file) => MIGRATION_PATTERN.test(file))
    .sort();
}

async function executeMigration(
  connection: Connection,
  filePath: string
): Promise<void> {
  const sql = await fs.readFile(filePath, "utf-8");
  const name = path.basename(filePath);
  console.log(`  Executing: ${name}`);
  await connection.query(sql);
  console.log(`  Completed: ${name}`);
}

async function runMigrations(): Promise<void> {
  console.log("=== Database Migration Runner ===\n");

  const migrationFiles = await getMigrationFiles();

  if (migrationFiles.length === 0) {
    console.log("No migration files found in:", MIGRATIONS_DIR);
    return;
  }

  console.log(`Found ${migrationFiles.length} migration file(s):\n`);
  migrationFiles.forEach((file) => console.log(`  - ${file}`));
  console.log("");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    multipleStatements: true,
  });

  try {
    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      await executeMigration(connection, filePath);
    }
    console.log("\n=== All migrations completed successfully ===");
  } catch (error) {
    console.error("\nMigration failed:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

const command = process.argv[2];

if (command === "db") {
  runMigrations().catch((err) => {
    console.error("Migration process exited with error:", err);
    process.exit(1);
  });
} else {
  console.log("Usage: npm setup db");
  console.log("  db - Run database migrations from migrations/ directory");
  process.exit(1);
}
