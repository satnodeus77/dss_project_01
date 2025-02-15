import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    console.log(`Received DELETE request for calculation with id: ${id}`);

    try {
      const result = await pool.query('DELETE FROM result_calculation WHERE id = $1', [id]);
      if (result.rowCount > 0) {
        console.log(`Calculation with id: ${id} deleted successfully`);
        res.status(200).json({ message: 'Calculation deleted successfully' });
      } else {
        console.log(`Calculation with id: ${id} not found`);
        res.status(404).json({ message: 'Calculation not found' });
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}