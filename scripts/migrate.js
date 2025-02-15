import { pool } from "../lib/db.js";

const runMigrations = async () => {
  try {
    console.log("📢 Running database migrations...");

    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        photo_url TEXT
      );
    `);
    console.log("✅ Users table is ready.");

    // Methods Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS methods (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        short_name TEXT UNIQUE NOT NULL
      );
    `);
    console.log("✅ Methods table is ready.");

    // Criteria Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS criteria (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        method_id INT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK (type IN ('Benefit', 'Cost')),
        weight DECIMAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (method_id) REFERENCES methods(id),
        FOREIGN KEY (user_id) REFERENCES users(uid)
      );
    `);
    console.log("✅ Criteria table is ready.");

    // Alternatives Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alternatives (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        method_id INT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (method_id) REFERENCES methods(id),
        FOREIGN KEY (user_id) REFERENCES users(uid)
      );
    `);
    console.log("✅ Alternatives table is ready.");

    // Result Calculation Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS result_calculation (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        method TEXT NOT NULL,
        criteria JSONB NOT NULL,
        alternatives JSONB NOT NULL,
        rank_results JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(uid)
      );
    `);
    console.log("✅ Result Calculation table is ready.");

    // Insert DSS Methods if not already inserted
    await pool.query(`
      INSERT INTO methods (name, short_name) VALUES
      ('Simple Additive Weighted (SAW)', 'SAW'),
      ('Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)', 'TOPSIS'),
      ('Weighted Product Model (WP)', 'WP')
      ON CONFLICT (short_name) DO NOTHING;
    `);
    console.log("✅ DSS methods initialized.");

    console.log("✅ Database setup completed successfully.");
  } catch (error) {
    console.error("❌ Error running migrations:", error);
  }
};

// Run migrations
runMigrations();