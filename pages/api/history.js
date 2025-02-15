import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { user_id } = req.query;
      const criteria = await pool.query(
        "SELECT * FROM criteria WHERE user_id = $1",
        [user_id]
      );
      const alternatives = await pool.query(
        "SELECT * FROM alternatives WHERE user_id = $1",
        [user_id]
      );
      res.status(200).json({ criteria: criteria.rows, alternatives: alternatives.rows });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
