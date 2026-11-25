import { pool } from '../lib/db.js';
import { seedDatabase } from '../lib/seed.js';

// Cache the database seed/migration status at the container level
let isDatabaseChecked = false;

/**
 * Public API endpoint to fetch all portfolio content.
 * Triggers migration and seed check automatically on load.
 */
export default async function handler(req, res) {
  // 1. Handle CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Automatically ensure database is migrated and seeded on cold start
    if (!isDatabaseChecked) {
      await seedDatabase();
      isDatabaseChecked = true;
    }

    // Set Vercel CDN Edge caching headers
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');

    // 3. Query all tables in parallel
    const [
      profileResult,
      experienceResult,
      projectsResult,
      skillsResult,
      certificationsResult,
      faqResult
    ] = await Promise.all([
      pool.query('SELECT * FROM profile LIMIT 1'),
      pool.query('SELECT * FROM experience ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM projects ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM skills ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM certifications ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM faq ORDER BY sort_order ASC')
    ]);

    // Format the profile row
    const profile = profileResult.rows[0] || null;

    // Services are not stored in the database; read them from profile.md
    const services = await loadServicesFromProfile();

    // Return combined payload
    return res.status(200).json({
      profile,
      experience: experienceResult.rows,
      projects: projectsResult.rows,
      skills: skillsResult.rows,
      services,
      certifications: certificationsResult.rows,
      faq: faqResult.rows
    });

  } catch (err) {
    console.warn('Database connection failed. Falling back to parsing local profile.md directly:', err.message);
    try {
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const profilePath = path.resolve(__dirname, '../profile.md');
      
      const { parseProfileMarkdown } = await import('../lib/parse-profile.js');
      const fallbackData = parseProfileMarkdown(profilePath);
      
      return res.status(200).json({
        profile: fallbackData.profile,
        experience: fallbackData.experience,
        projects: fallbackData.projects,
        skills: fallbackData.skills,
        services: fallbackData.services,
        certifications: fallbackData.certifications,
        faq: fallbackData.faq,
        is_fallback: true
      });
    } catch (fallbackErr) {
      console.error('Fallback parsing failed:', fallbackErr);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve website content.'
      });
    }
  }
}

/**
 * Reads the Services list from profile.md (services are not stored in the database).
 */
async function loadServicesFromProfile() {
  try {
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const { parseProfileMarkdown } = await import('../lib/parse-profile.js');
    return parseProfileMarkdown(path.resolve(__dirname, '../profile.md')).services || [];
  } catch (err) {
    console.warn('Could not load services from profile.md:', err.message);
    return [];
  }
}
