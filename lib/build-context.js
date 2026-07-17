import { pool } from './db.js';
import { parseProfileMarkdown } from './parse-profile.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Builds a structured, plain-text context string from database rows,
 * with a fallback to parsing profile.md directly if the database is unreachable.
 * 
 * @returns {Promise<string>} Structured text context block for the LLM
 */
export async function buildContext() {
  try {
    // 1. Attempt to load from PostgreSQL
    const [
      profileResult,
      experienceResult,
      projectsResult,
      skillsResult,
      faqResult
    ] = await Promise.all([
      pool.query('SELECT * FROM profile LIMIT 1'),
      pool.query('SELECT * FROM experience ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM projects ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM skills ORDER BY sort_order ASC'),
      pool.query('SELECT * FROM faq ORDER BY sort_order ASC')
    ]);

    const profile = profileResult.rows[0];
    if (!profile) {
      // If table is empty, fall back to parsing local profile.md
      throw new Error('Database tables are empty');
    }

    return formatContext(
      profile,
      experienceResult.rows,
      projectsResult.rows,
      skillsResult.rows,
      faqResult.rows
    );

  } catch (err) {
    console.warn('Database unreachable in buildContext, falling back to local profile.md:', err.message);
    
    // 2. Fallback to parsing local profile.md
    try {
      const profilePath = path.resolve(__dirname, '../profile.md');
      if (!fs.existsSync(profilePath)) {
        throw new Error(`Fallback source not found at ${profilePath}`);
      }
      
      const data = parseProfileMarkdown(profilePath);
      return formatContext(
        data.profile,
        data.experience,
        data.projects,
        data.skills,
        data.faq
      );
    } catch (fallbackErr) {
      console.error('All context sources failed:', fallbackErr);
      throw new Error('Context generation failed. No data source available.');
    }
  }
}

/**
 * Helper to format raw data objects into a clear, unified textual schema
 */
function formatContext(profile, experience, projects, skills, faq) {
  let context = '';

  // Profile Info
  context += `Personal Profile Info:\n`;
  context += `- Name: ${profile.name || 'Yerrithatha Choppa'}\n`;
  context += `- Title: ${profile.title || ''}\n`;
  context += `- Location: ${profile.location || ''}\n`;
  context += `- Email: ${profile.email || ''}\n`;
  context += `- LinkedIn: ${profile.linkedin_url || ''}\n`;
  context += `- GitHub: ${profile.github_url || ''}\n`;
  context += `- Bio: ${profile.bio || ''}\n\n`;

  // Professional Experience
  context += `Professional Work Experience:\n`;
  if (experience && experience.length > 0) {
    experience.forEach(exp => {
      const dates = exp.end_date ? `${exp.start_date} – ${exp.end_date}` : `${exp.start_date} – Present`;
      context += `- Role: ${exp.role}\n`;
      context += `  Company: ${exp.company}\n`;
      context += `  Dates: ${dates}\n`;
      
      // Parse bullets list
      const bullets = typeof exp.bullets === 'string' ? JSON.parse(exp.bullets) : exp.bullets;
      if (Array.isArray(bullets) && bullets.length > 0) {
        context += `  Accomplishments:\n`;
        bullets.forEach(b => {
          context += `    * ${b}\n`;
        });
      }
      context += `\n`;
    });
  } else {
    context += `(No experience entries recorded)\n\n`;
  }

  // Projects
  context += `Featured Projects:\n`;
  if (projects && projects.length > 0) {
    projects.forEach(proj => {
      context += `- Project Title: ${proj.title}\n`;
      context += `  Description: ${proj.description}\n`;
      
      const tech = typeof proj.tech === 'string' ? JSON.parse(proj.tech) : proj.tech;
      if (Array.isArray(tech) && tech.length > 0) {
        context += `  Tech Stack: ${tech.join(', ')}\n`;
      }
      if (proj.project_url) context += `  Link: ${proj.project_url}\n`;
      if (proj.video_url) context += `  Video Demo: ${proj.video_url}\n`;
      context += `\n`;
    });
  } else {
    context += `(No projects recorded)\n\n`;
  }

  // Skills
  context += `Skills & Expertise:\n`;
  if (skills && skills.length > 0) {
    const techSkills = skills.filter(s => s.category === 'technical').map(s => s.name);
    const toolSkills = skills.filter(s => s.category === 'tools').map(s => s.name);
    const softSkills = skills.filter(s => s.category === 'soft').map(s => s.name);

    if (techSkills.length > 0) context += `- Technical Skills: ${techSkills.join(', ')}\n`;
    if (toolSkills.length > 0) context += `- Tools & Platforms: ${toolSkills.join(', ')}\n`;
    if (softSkills.length > 0) context += `- Soft Skills: ${softSkills.join(', ')}\n`;
    context += `\n`;
  } else {
    context += `(No skills recorded)\n\n`;
  }

  // FAQ
  context += `Frequently Asked Questions (FAQ):\n`;
  if (faq && faq.length > 0) {
    faq.forEach(item => {
      context += `- Q: ${item.question}\n`;
      context += `  A: ${item.answer}\n\n`;
    });
  } else {
    context += `(No FAQs recorded)\n\n`;
  }

  return context.trim();
}
