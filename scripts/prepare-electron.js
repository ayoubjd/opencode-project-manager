/**
 * Creates a fresh database with seed data and copies it alongside
 * the files electron-builder will pack into the app resources.
 *
 * Run AFTER `next build`.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");

function ensureDb() {
  const dbPath = path.join(root, "dev.db");

  if (fs.existsSync(dbPath)) {
    console.log("  ℹ  dev.db already exists, reusing it");
    return dbPath;
  }

  console.log("  ℹ  Creating fresh dev.db with schema + seed data…");

  execSync("npx prisma db push --accept-data-loss", {
    cwd: root,
    stdio: "inherit",
  });

  execSync("npx tsx prisma/seed.ts", {
    cwd: root,
    stdio: "inherit",
  });

  console.log("  ✓  dev.db created");
  return dbPath;
}

console.log("\n=== Preparing assets for Electron packaging ===\n");
ensureDb();
console.log("Done.\n");
