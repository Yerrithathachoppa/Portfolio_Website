import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Load env secrets directly from .env.local to search for them
let secrets = {};
try {
  const envPath = path.resolve(ROOT_DIR, '.env.local');
  if (fs.existsSync(envPath)) {
    const rawEnv = fs.readFileSync(envPath, 'utf8');
    rawEnv.split(/\r?\n/).forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (key && val && !key.startsWith('#')) {
          secrets[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.log('Could not load .env.local for scanning. Scanning for placeholders instead.');
}

// Add generic patterns
const patterns = [
  { name: 'Groq API Key Prefix', regex: /gsk_[a-zA-Z0-9]{40,}/gi },
  { name: 'Potential Hardcoded Secret Key', regex: /jwt_secret|admin_password/gi }
];

// Add actual values if loaded
Object.keys(secrets).forEach(key => {
  if (secrets[key] && secrets[key].length > 3) {
    patterns.push({
      name: `Actual Env Secret: ${key}`,
      regex: new RegExp(escapeRegExp(secrets[key]), 'g')
    });
  }
});

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const foldersToScan = ['public', 'admin'];
let failures = 0;

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        scanDir(fullPath);
      }
    } else {
      // Only scan text assets
      const ext = path.extname(file).toLowerCase();
      if (['.html', '.css', '.js', '.json', '.txt'].includes(ext)) {
        scanFile(fullPath);
      }
    }
  }
}

function scanFile(filePath) {
  const relative = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, 'utf8');

  patterns.forEach(pat => {
    // Skip checking package.json for dependencies name
    if (relative === 'package.json' && pat.name.includes('Secret')) return;
    
    const matches = content.match(pat.regex);
    if (matches) {
      console.error(`\x1b[31m[LEAK DETECTED]\x1b[0m File: ${relative} matches pattern "${pat.name}"`);
      failures++;
    }
  });
}

console.log('--- STARTING SECURITY LEAK AUDIT ---');
console.log(`Scanning folders: ${foldersToScan.join(', ')}`);
console.log(`Loaded ${patterns.length} secrets/patterns to check.`);

foldersToScan.forEach(folder => {
  const p = path.resolve(ROOT_DIR, folder);
  if (fs.existsSync(p)) {
    scanDir(p);
  }
});

console.log('\n--- AUDIT RESULT ---');
if (failures === 0) {
  console.log('\x1b[32m[PASSED]\x1b[0m No secrets or credential patterns detected in client-facing folder directories!');
} else {
  console.error(`\x1b[31m[FAILED]\x1b[0m Detected ${failures} potential security leaks. Fix before deploying!`);
  process.exit(1);
}
