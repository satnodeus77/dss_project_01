import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, values } = req.body;

    try {
      const result = await pool.query(
        'INSERT INTO alternatives (name, values) VALUES ($1, $2) RETURNING id',
        [name, values]
      );

      const newAlternative = result.rows[0];
      res.status(200).json(newAlternative);
    } catch (error) {
      console.error('Error creating alternative:', error);
      res.status(500).json({ error: 'Failed to create alternative.', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}