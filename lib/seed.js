import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './db.js';
import { runMigrations } from './migrate.js';
import { parseProfileMarkdown } from './parse-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase(force = false) {
  const client = await pool.connect();
  
  try {
    // 1. Ensure migrations are run first to guarantee tables exist
    await runMigrations();
    
    // 2. Check if database has already been seeded
    const checkResult = await client.query('SELECT COUNT(*) FROM profile');
    const count = parseInt(checkResult.rows[0].count, 10);
    
    if (count > 0 && !force) {
      console.log('Database already seeded. Updating profile links.');
      await client.query("UPDATE profile SET resume_url = '/YCHOPPA_newV2.pdf' WHERE resume_url IS NULL OR resume_url = ''");
      await client.query("UPDATE profile SET github_url = 'https://github.com/Yerrithathachoppa' WHERE github_url LIKE '%Yerrithatha-choppa%'");
      await client.query("UPDATE profile SET photo_url = '/ychoppa.jpg' WHERE photo_url IS NULL OR photo_url = ''");
      return { success: true, message: 'Already seeded' };
    }
    
    console.log('Database is empty or forcing re-seed. Initiating seeding process...');
    
    // If forcing re-seed, truncate tables first
    if (force) {
      console.log('Truncating tables for forced re-seed...');
      await client.query('TRUNCATE profile, experience, projects, skills, certifications, faq, admin_meta RESTART IDENTITY CASCADE');
    }
    
    // Resolve profile.md path relative to this script
    const profilePath = path.resolve(__dirname, '../profile.md');
    if (!fs.existsSync(profilePath)) {
      throw new Error(`Seed source profile.md not found at ${profilePath}`);
    }
    
    const parsedData = parseProfileMarkdown(profilePath);
    
    // 3. Begin transaction for atomicity
    await client.query('BEGIN');
    
    // Insert Profile
    const profileQuery = `
      INSERT INTO profile (name, title, location, email, linkedin_url, github_url, bio, photo_url, resume_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const p = parsedData.profile;
    await client.query(profileQuery, [
      p.name, p.title, p.location, p.email, p.linkedin_url, p.github_url, p.bio, p.photo_url, p.resume_url
    ]);
    
    // Insert Experience
    const expQuery = `
      INSERT INTO experience (company, role, start_date, end_date, bullets, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    for (const exp of parsedData.experience) {
      await client.query(expQuery, [
        exp.company, exp.role, exp.start_date, exp.end_date, JSON.stringify(exp.bullets), exp.sort_order
      ]);
    }
    
    // Insert Projects
    const projQuery = `
      INSERT INTO projects (title, description, tech, thumbnail_url, video_url, project_url, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    for (const proj of parsedData.projects) {
      await client.query(projQuery, [
        proj.title, proj.description, JSON.stringify(proj.tech), proj.thumbnail_url, proj.video_url, proj.project_url, proj.sort_order
      ]);
    }
    
    // Insert Skills
    const skillQuery = `
      INSERT INTO skills (category, name, sort_order)
      VALUES ($1, $2, $3)
    `;
    for (const skill of parsedData.skills) {
      await client.query(skillQuery, [
        skill.category, skill.name, skill.sort_order
      ]);
    }
    
    // Insert FAQ
    const faqQuery = `
      INSERT INTO faq (question, answer, sort_order)
      VALUES ($1, $2, $3)
    `;
    for (const item of parsedData.faq) {
      await client.query(faqQuery, [
        item.question, item.answer, item.sort_order
      ]);
    }
    
    // Insert Certifications
    const certQuery = `
      INSERT INTO certifications (name, url, sort_order)
      VALUES ($1, $2, $3)
    `;
    if (parsedData.certifications && parsedData.certifications.length > 0) {
      for (const cert of parsedData.certifications) {
        await client.query(certQuery, [
          cert.name, cert.url, cert.sort_order
        ]);
      }
    }
    
    // Record seed timestamp in admin_meta
    const metaQuery = `
      INSERT INTO admin_meta (key, value)
      VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
    await client.query(metaQuery, ['seeded_at', new Date().toISOString()]);
    
    // 4. Commit transaction
    await client.query('COMMIT');
    console.log('Database seeded successfully.');
    
    return { success: true, message: 'Seeded successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database seeding failed, transaction rolled back:', err);
    throw err;
  } finally {
    client.release();
  }
}
