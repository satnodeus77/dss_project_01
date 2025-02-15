import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    try {
      await pool.query('DELETE FROM results WHERE id = $1', [id]);
      res.status(200).json({ message: 'Result deleted successfully.' });
    } catch (error) {
      console.error('Error deleting result:', error);
      res.status(500).json({ error: 'Failed to delete result.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}