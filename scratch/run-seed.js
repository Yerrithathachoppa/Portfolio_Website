import { seedDatabase } from '../lib/seed.js';
import { pool } from '../lib/db.js';

async function run() {
  console.log('Starting local seeding process...');
  console.log(`Using Database URL: ${process.env.DATABASE_URL ? 'Loaded (masked)' : 'NOT FOUND'}`);
  
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not defined.');
    process.exit(1);
  }

  try {
    const result = await seedDatabase();
    console.log('Seeding result:', result);
  } catch (err) {
    console.error('Seeding script failed with error:', err);
  } finally {
    // Close connection pool so process can exit
    await pool.end();
    console.log('Database pool connection closed.');
  }
}

run();
