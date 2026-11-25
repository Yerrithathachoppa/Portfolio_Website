import { timingSafeEqual } from 'crypto';
import { seedDatabase } from '../lib/seed.js';

/**
 * Admin-only Vercel Serverless Function to run migrations and (re)seed the database.
 *
 * Disabled unless the ADMIN_PASSWORD environment variable is set.
 * Call with:  POST /api/seed            (seed only if empty)
 *             POST /api/seed?force=true (wipe and re-seed from profile.md)
 * and header: Authorization: Bearer <ADMIN_PASSWORD>
 */
export default async function handler(req, res) {
  const secret = process.env.ADMIN_PASSWORD;

  // Endpoint is switched off entirely when no admin secret is configured
  if (!secret) {
    return res.status(404).json({ error: 'Not Found' });
  }

  // Only POST, so the action can't be triggered by a link, crawler, or <img> tag
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAuthorized(req.headers?.authorization, secret)) {
    return res.status(401).json({ error: 'Unauthorized' });
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
    // Log details server-side only; never return stack traces to the client
    console.error('Seeding API endpoint error:', err);
    return res.status(500).json({ success: false, error: 'Seeding failed' });
  }
}

/**
 * Constant-time check of an "Authorization: Bearer <token>" header against the secret.
 */
function isAuthorized(header, secret) {
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const provided = Buffer.from(header.slice('Bearer '.length));
  const expected = Buffer.from(secret);
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
