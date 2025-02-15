import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { user_id, method_id, name, type, weight } = req.body;
      const result = await pool.query(
        "INSERT INTO criteria (user_id, method_id, name, type, weight) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [user_id, method_id, name, type, weight]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error inserting criteria:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
