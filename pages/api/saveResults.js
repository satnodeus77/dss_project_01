import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId, method, results } = req.body;

    try {
      const methodResult = await pool.query('SELECT id FROM methods WHERE short_name = $1', [method]);
      if (methodResult.rows.length === 0) {
        throw new Error(`Method not found for short_name: ${method}`);
      }
      const methodId = methodResult.rows[0].id;

      for (const result of results) {
        await pool.query(
          'INSERT INTO results (user_id, method_id, alternative_id, score, rank) VALUES ($1, $2, $3, $4, $5)',
          [userId, methodId, result.alternativeId, result.score, result.rank]
        );
      }

      res.status(200).json({ message: 'Results saved successfully.' });
    } catch (error) {
      console.error('Error saving results:', error);
      res.status(500).json({ error: 'Failed to save results.', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}