import handler from '../api/content.js';
import { pool } from '../lib/db.js';

// Mock request and response objects
const req = {
  method: 'GET'
};

const res = {
  statusCode: 200,
  headers: {},
  setHeader(name, val) {
    this.headers[name] = val;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(data) {
    console.log('\n--- API response ---');
    console.log(`Status Code: ${this.statusCode}`);
    console.log('Headers:', this.headers);
    console.log('Body:', JSON.stringify(data, null, 2));
    return this;
  }
};

async function test() {
  console.log('Invoking /api/content handler mock...');
  try {
    await handler(req, res);
  } catch (err) {
    console.error('Unhandled handler error:', err);
  } finally {
    await pool.end();
  }
}

test();
