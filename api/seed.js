import { seedDatabase } from '../lib/seed.js';

/**
 * Vercel Serverless Function to run migrations and seed the database.
 * Accessible locally at http://localhost:3000/api/seed
 */
export default async function handler(req, res) {
  // Allow only GET or POST for seeding
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const force = req.query?.force === 'true' || req.query?.reseed === 'true';
    const result = await seedDatabase(force);
    return res.status(200).json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Seeding API endpoint error:', err);
    return res.status(500).json({
      success: false,
      error: err.message,
      details: err.stack
    });
  }
}
