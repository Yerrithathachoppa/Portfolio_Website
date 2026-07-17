import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import contentHandler from '../api/content.js';
import chatHandler from '../api/chat.js';
import seedHandler from '../api/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Helper to wrap Vercel handler to express compatibility
function makeExpressHandler(vercelHandler) {
  return async (req, res) => {
    // Vercel serverless requests have cookies parsed
    req.cookies = req.cookies || {};
    
    // Add Vercel helper properties to res if missing
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
    
    try {
      await vercelHandler(req, res);
    } catch (err) {
      console.error('API Error in dev-server wrapper:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
      }
    }
  };
}

// Serve public static assets
app.use('/', express.static(path.join(__dirname, '../public')));

// Serverless API route bindings
app.all('/api/content', makeExpressHandler(contentHandler));
app.all('/api/chat', makeExpressHandler(chatHandler));
app.all('/api/seed', makeExpressHandler(seedHandler));

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`Local Portfolio Server listening at http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
