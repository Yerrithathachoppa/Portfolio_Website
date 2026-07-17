import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseProfileMarkdown } from './parse-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DB_PATH = path.resolve(__dirname, 'fallback-db.json');
const PROFILE_MD_PATH = path.resolve(__dirname, '../profile.md');

/**
 * Returns the entire JSON state of the mock database.
 * If file does not exist, it seeds it from profile.md.
 */
export function getFallbackData() {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    console.log('Fallback JSON database not found. Seeding from profile.md...');
    const seededData = parseProfileMarkdown(PROFILE_MD_PATH);
    saveFallbackData(seededData);
    return seededData;
  }

  try {
    const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading fallback JSON database:', err);
    // Re-seed on corruption
    const seededData = parseProfileMarkdown(PROFILE_MD_PATH);
    saveFallbackData(seededData);
    return seededData;
  }
}

/**
 * Persists the JSON state to the disk fallback file.
 */
export function saveFallbackData(data) {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to fallback JSON database:', err);
  }
}
