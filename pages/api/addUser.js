import { pool } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { uid, displayName, email, photoURL } = req.body;

    console.log(`Received request to add user with UID: ${uid}`);

    try {
      // Check if the user already exists
      const userCheck = await pool.query('SELECT uid FROM users WHERE uid = $1', [uid]);
      console.log(`User check result: ${JSON.stringify(userCheck.rows)}`);
      
      if (userCheck.rowCount === 0) {
        // Insert the new user
        const insertResult = await pool.query(
          'INSERT INTO users (uid, name, email, photo_url) VALUES ($1, $2, $3, $4)',
          [uid, displayName, email, photoURL]
        );
        console.log(`User with UID: ${uid} added successfully`);
        res.status(200).json({ message: 'User added successfully' });
      } else {
        console.log(`User with UID: ${uid} already exists`);
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