import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, method, criteria, alternatives, rankResults } = req.body;

    try {
      const result = await pool.query(
        'INSERT INTO result_calculation (user_id, method, criteria, alternatives, rank_results) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, method, criteria, alternatives, rankResults]
      );

      const newCalculation = result.rows[0];
      res.status(200).json(newCalculation);
    } catch (error) {
      console.error('Error saving calculation:', error);
      res.status(500).json({ error: 'Failed to save calculation.', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}