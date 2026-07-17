import profileHandler from '../api/admin/profile.js';
import experienceHandler from '../api/admin/experience.js';
import { signToken } from '../lib/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FALLBACK_DB_PATH = path.resolve(__dirname, '../lib/fallback-db.json');

// Mock response builder
class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = null;
  }
  setHeader(name, val) {
    this.headers[name.toLowerCase()] = val;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(data) {
    this.body = data;
    return this;
  }
  end() {
    return this;
  }
}

async function run() {
  console.log('--- TESTING ADMIN CRUD SYSTEM (FALLBACK MODE) ---');

  // Remove existing fallback db if any to test seed-on-run
  if (fs.existsSync(FALLBACK_DB_PATH)) {
    fs.unlinkSync(FALLBACK_DB_PATH);
    console.log('Removed old fallback JSON database.');
  }

  // Generate auth token
  const token = signToken();
  const authHeaders = {
    cookie: `admin_session=${token}`
  };

  // 1. Test GET Profile
  console.log('\n1. Testing GET Profile...');
  const reqGetProfile = { method: 'GET', headers: authHeaders };
  const resGetProfile = new MockResponse();
  await profileHandler(reqGetProfile, resGetProfile);
  console.log(`Status: ${resGetProfile.statusCode}`);
  console.log(`Profile Name: ${resGetProfile.body.name}`);
  console.log(`Profile Bio sentence count: ${resGetProfile.body.bio ? resGetProfile.body.bio.split('.').length : 0}`);

  // 2. Test PUT Profile
  console.log('\n2. Testing PUT Profile...');
  const reqPutProfile = {
    method: 'PUT',
    headers: authHeaders,
    body: {
      name: 'Yerrithatha Choppa Modified',
      bio: 'This is my modified bio.'
    }
  };
  const resPutProfile = new MockResponse();
  await profileHandler(reqPutProfile, resPutProfile);
  console.log(`Status: ${resPutProfile.statusCode}`);
  console.log(`New Profile Name: ${resPutProfile.body.name}`);
  console.log(`New Profile Bio: ${resPutProfile.body.bio}`);

  // 3. Test POST Experience
  console.log('\n3. Testing POST Experience...');
  const reqPostExp = {
    method: 'POST',
    headers: authHeaders,
    body: {
      company: 'Test Company LLC',
      role: 'Software Architect',
      start_date: 'Jan 2026',
      end_date: 'Present',
      bullets: ['Automated mock databases', 'Designed robust fallbacks']
    }
  };
  const resPostExp = new MockResponse();
  await experienceHandler(reqPostExp, resPostExp);
  console.log(`Status: ${resPostExp.statusCode}`);
  console.log(`New Job ID: ${resPostExp.body.id}`);
  console.log(`New Job Role: ${resPostExp.body.role}`);

  // 4. Test GET Experiences
  console.log('\n4. Testing GET Experiences...');
  const reqGetExps = { method: 'GET', headers: authHeaders };
  const resGetExps = new MockResponse();
  await experienceHandler(reqGetExps, resGetExps);
  console.log(`Status: ${resGetExps.statusCode}`);
  console.log(`Total Job Entries: ${resGetExps.body.length}`);
  console.log('Jobs list roles:', resGetExps.body.map(j => `${j.company} - ${j.role}`));

  // 5. Test PUT Experience
  const expToEdit = resPostExp.body;
  console.log('\n5. Testing PUT Experience on ID:', expToEdit.id);
  const reqPutExp = {
    method: 'PUT',
    headers: authHeaders,
    body: {
      id: expToEdit.id,
      company: 'Test Company LLC Modified',
      role: 'Principal Software Architect',
      bullets: expToEdit.bullets
    }
  };
  const resPutExp = new MockResponse();
  await experienceHandler(reqPutExp, resPutExp);
  console.log(`Status: ${resPutExp.statusCode}`);
  console.log(`Updated Job Role: ${resPutExp.body.role}`);
  console.log(`Updated Job Company: ${resPutExp.body.company}`);

  // 6. Test DELETE Experience
  console.log('\n6. Testing DELETE Experience on ID:', expToEdit.id);
  const reqDelExp = {
    method: 'DELETE',
    headers: authHeaders,
    body: { id: expToEdit.id }
  };
  const resDelExp = new MockResponse();
  await experienceHandler(reqDelExp, resDelExp);
  console.log(`Status: ${resDelExp.statusCode}`);
  console.log('Body:', resDelExp.body);

  // 7. Verify GET Experiences has reverted to previous count
  console.log('\n7. Verifying experience deletion...');
  const resGetExpsFinal = new MockResponse();
  await experienceHandler({ method: 'GET', headers: authHeaders }, resGetExpsFinal);
  console.log(`Total Job Entries: ${resGetExpsFinal.body.length}`);

}

run();
