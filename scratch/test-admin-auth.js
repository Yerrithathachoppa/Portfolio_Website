import loginHandler from '../api/admin/login.js';
import { requireAuth } from '../lib/auth.js';

// Setup Mock Response to capture Set-Cookie
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
  console.log('--- TESTING ADMIN AUTH SYSTEM ---');
  
  // 1. Test failed login
  console.log('\n1. Testing login with wrong password...');
  const reqFail = {
    method: 'POST',
    body: { password: 'wrongpassword' }
  };
  const resFail = new MockResponse();
  await loginHandler(reqFail, resFail);
  console.log(`Response Status: ${resFail.statusCode}`);
  console.log('Response Body:', resFail.body);

  // 2. Test successful login
  console.log('\n2. Testing login with correct password...');
  const reqSuccess = {
    method: 'POST',
    body: { password: process.env.ADMIN_PASSWORD || 'admin123' } // uses default if env missing
  };
  const resSuccess = new MockResponse();
  await loginHandler(reqSuccess, resSuccess);
  console.log(`Response Status: ${resSuccess.statusCode}`);
  console.log('Cookie Header:', resSuccess.headers['set-cookie']);
  console.log('Response Body:', resSuccess.body);

  // 3. Test requireAuth middleware with mock cookies
  console.log('\n3. Testing requireAuth with correct cookie...');
  const setCookieVal = resSuccess.headers['set-cookie'];
  const token = setCookieVal ? setCookieVal.split(';')[0].split('=')[1] : null;

  if (token) {
    const reqAuthed = {
      headers: {
        cookie: `admin_session=${token}`
      }
    };
    try {
      const decoded = requireAuth(reqAuthed);
      console.log('Authorization success! Decoded payload:', decoded);
    } catch (e) {
      console.error('Authorization failed when it should have succeeded:', e.message);
    }
  } else {
    console.error('Error: Token not generated during login.');
  }

  // 4. Test requireAuth middleware with missing cookie
  console.log('\n4. Testing requireAuth with missing cookie...');
  const reqUnauthed = {
    headers: {}
  };
  try {
    requireAuth(reqUnauthed);
    console.error('Error: Authorization succeeded when it should have failed (missing cookie).');
  } catch (e) {
    console.log('Authorization correctly rejected! Error:', e.message, `(Status: ${e.statusCode})`);
  }
}

run();
