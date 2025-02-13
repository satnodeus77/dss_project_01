import pool from "../lib/db.js";

const runMigrations = async () => {
  console.log("📢 Running database migrations...");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✅ Migration successful: Users table is ready.");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  } finally {
    pool.end();
  }
};

runMigrations();
