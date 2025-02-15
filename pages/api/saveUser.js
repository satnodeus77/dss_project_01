import { pool } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { uid, name, email } = req.body;

  try {
    console.log("📢 Received Data:", req.body);

    const query = `
      INSERT INTO users (uid, name, email)
      VALUES ($1, $2, $3)
      ON CONFLICT (uid) DO UPDATE 
      SET name = EXCLUDED.name;
    `;
    
    await pool.query(query, [uid, name, email]);
    console.log("✅ User saved successfully");

    res.status(200).json({ message: "User saved successfully!" });
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}