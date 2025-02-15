import { pool } from '../../lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;

  try {
    const result = await pool.query(
      'SELECT r.*, m.name as method_name FROM results r JOIN methods m ON r.method_id = m.id WHERE r.user_id = $1 ORDER BY r.created_at DESC',
      [userId]
    );

    res.status(200).json({ results: result.rows });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results.' });
  }
}