import fs from "fs";
import path from "path";

import { prisma } from "../lib/prisma";

async function main() {
  const migrationPath = path.resolve(
    __dirname,
    "../../prisma/migrations/202607031915_init/migration.sql",
  );
  const sql = fs.readFileSync(migrationPath, "utf8");

  for (const statement of sql
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    await prisma.$executeRawUnsafe(`${statement};`);
  }

  console.log("Database schema initialized.");
}

main()
  .catch((error) => {
    console.error("Database bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
