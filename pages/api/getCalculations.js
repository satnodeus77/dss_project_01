import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    try {
      const result = await pool.query('SELECT * FROM result_calculation WHERE user_id = $1', [userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching calculations:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}