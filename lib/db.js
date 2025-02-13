import pkg from "pg";
const { Pool } = pkg;



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Function to create the users table
const createUsersTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("✅ Users table is ready.");
  } catch (error) {
    console.error("❌ Error creating users table:", error);
  }
};

// Run table creation on app start
createUsersTable();

export default pool;
