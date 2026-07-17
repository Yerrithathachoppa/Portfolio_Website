import path from 'path';
import { fileURLToPath } from 'url';
import { parseProfileMarkdown } from '../lib/parse-profile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const profilePath = path.resolve(__dirname, '../profile.md');
  console.log(`Loading profile from: ${profilePath}`);
  
  try {
    const data = parseProfileMarkdown(profilePath);
    console.log('\n--- PARSED DATA SUMMARY ---');
    console.log(`Profile Name: ${data.profile.name}`);
    console.log(`Profile Title: ${data.profile.title}`);
    console.log(`Experience Entries: ${data.experience.length}`);
    console.log(`Project Entries: ${data.projects.length}`);
    console.log(`Skill Entries: ${data.skills.length}`);
    console.log(`FAQ Entries: ${data.faq.length}`);
    
    console.log('\n--- DETAILED JSON ---');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (err) {
    console.error('Error during test execution:', err);
  }
}

run();
