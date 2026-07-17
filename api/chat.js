import Groq from 'groq-sdk';
import { buildContext } from '../lib/build-context.js';
import { getSystemPrompt } from '../lib/system-prompt.js';

// In-memory rate limiting map
// Format: IP -> Array of timestamps
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

/**
 * Handles sliding window rate limiting.
 * Returns true if allowed, false if limited.
 */
function isRateLimitAllowed(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, [now]);
    return true;
  }

  const timestamps = rateLimitMap.get(ip);
  // Filter timestamps within the current window
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps); // Update with filtered list
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

/**
 * Vercel Serverless Function to handle floating AI chat widget inquiries.
 * Streams replies token-by-token using SSE.
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting Check
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '127.0.0.1';
  if (!isRateLimitAllowed(ip)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: "I'm receiving a lot of questions right now! Please wait a moment and try again, or feel free to email me directly at ychoppa123@gmail.com."
    });
  }

  const { message, history } = req.body || {};
  if (!message) {
    return res.status(400).json({ error: 'Missing message parameter' });
  }

  try {
    // 1. Initialize Groq SDK
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not defined.');
    }
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 2. Fetch context and compile prompt
    const context = await buildContext();
    const systemPrompt = getSystemPrompt(context);

    // 3. Assemble full messages history
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Append history items safely if provided
    if (Array.isArray(history)) {
      history.forEach(item => {
        if (item.role && item.content) {
          messages.push({ role: item.role, content: item.content });
        }
      });
    }

    // Append the current user query
    messages.push({ role: 'user', content: message });

    // 4. Initialize stream headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 5. Trigger LLM call with streaming on Groq
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 500,
      stream: true
    });

    // 6. Write chunk content back to connection
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ token: content })}\n\n`);
      }
    }

    // Terminate stream
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (err) {
    console.error('Chat endpoint error:', err);
    
    // If headers already set, we must end the response stream rather than sending JSON
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Error generating response. Please reach out to me directly at ychoppa123@gmail.com.' })}\n\n`);
      res.end();
    } else {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong with the AI assistant. Please contact me at ychoppa123@gmail.com.'
      });
    }
  }
}
