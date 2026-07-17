import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running database migrations...');
    await query(schemaSql);
    console.log('Database migrations completed successfully.');
    return { success: true };
  } catch (err) {
    console.error('Database migration failed:', err);
    throw err;
  }
}
