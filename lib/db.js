import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Heroku
});

// Function to create necessary tables
const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE
      );
    `);
    console.log("✅ Users table is ready.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS methods (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        short_name TEXT UNIQUE NOT NULL
      );
    `);
    console.log("✅ Methods table is ready.");

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        method_id INT NOT NULL,
        alternative_id INT NOT NULL,
        score DECIMAL NOT NULL,
        rank INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (method_id) REFERENCES methods(id),
        FOREIGN KEY (alternative_id) REFERENCES alternatives(id),
        FOREIGN KEY (user_id) REFERENCES users(uid)
      );
    `);
    console.log("✅ Results table is ready.");

    await pool.query(`
      INSERT INTO methods (name, short_name) VALUES
      ('Simple Additive Weighted (SAW)', 'SAW'),
      ('Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)', 'TOPSIS'),
      ('Weighted Product Model (WP)', 'WP')
      ON CONFLICT (short_name) DO NOTHING;
    `);
    console.log("✅ DSS methods initialized.");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  }
};

// Run table creation on app start
createTables();

// ✅ Important: Don't close the pool here, keep it open for future queries
export default pool;
