import handler from '../api/chat.js';
import { pool } from '../lib/db.js';

// Mock request
const req = {
  method: 'POST',
  headers: {
    'x-forwarded-for': '127.0.0.1'
  },
  body: {
    message: 'What is your current title and company?',
    history: []
  }
};

// Mock response to collect stream chunks
const res = {
  headers: {},
  setHeader(name, val) {
    this.headers[name] = val;
  },
  write(chunk) {
    // Parse SSE chunk
    const str = chunk.toString();
    if (str.startsWith('data: ')) {
      const dataStr = str.substring(6).trim();
      if (dataStr === '[DONE]') {
        console.log('\n--- Stream Finished ---');
      } else {
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.token) {
            process.stdout.write(parsed.token);
          } else if (parsed.error) {
            console.error('\nError token received:', parsed.error);
          }
        } catch (e) {
          console.log('\nRaw chunk:', dataStr);
        }
      }
    }
  },
  status(code) {
    console.log(`Status Code: ${code}`);
    return this;
  },
  json(data) {
    console.log('JSON Response:', JSON.stringify(data, null, 2));
    return this;
  },
  end() {
    console.log('\nResponse transmission complete.');
  }
};

async function test() {
  console.log('Testing /api/chat handler mock...');
  console.log('User query:', req.body.message);
  console.log('--------------------------------');

  try {
    await handler(req, res);
  } catch (err) {
    console.error('API execution threw error:', err);
  } finally {
    await pool.end();
  }
}

test();
