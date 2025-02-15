import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, method, criteria, alternatives, rankResults } = req.body;

    try {
      // Verify that the userId exists in the users table
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
      if (userCheck.rowCount === 0) {
        return res.status(400).json({ error: 'Invalid user ID.' });
      }

      const result = await pool.query(
        'INSERT INTO result_calculation (user_id, method, criteria, alternatives, rank_results) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [userId, method, JSON.stringify(criteria), JSON.stringify(alternatives), JSON.stringify(rankResults)]
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