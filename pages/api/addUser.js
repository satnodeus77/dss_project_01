import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { uid, displayName, email, photoURL } = req.body;

    try {
      // Check if the user already exists
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [uid]);
      if (userCheck.rowCount === 0) {
        // Insert the new user
        await pool.query(
          'INSERT INTO users (id, display_name, email, photo_url) VALUES ($1, $2, $3, $4)',
          [uid, displayName, email, photoURL]
        );
        res.status(200).json({ message: 'User added successfully' });
      } else {
        res.status(200).json({ message: 'User already exists' });
      }
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}