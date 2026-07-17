import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
}
if (!ADMIN_PASSWORD) {
  throw new Error('FATAL: ADMIN_PASSWORD environment variable is not defined.');
}

/**
 * Checks if the provided password matches the ADMIN_PASSWORD environment variable.
 */
export function verifyPassword(password) {
  return password === ADMIN_PASSWORD;
}

/**
 * Signs a JWT session token with a 4-hour expiration.
 */
export function signToken() {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '4h' });
}

/**
 * Verifies and decodes the JWT session token.
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired session token');
  }
}

/**
 * Extracts the session token from the Request headers cookie.
 */
export function extractToken(req) {
  // Try req.cookies populated by Vercel helper
  if (req.cookies && req.cookies.admin_session) {
    return req.cookies.admin_session;
  }

  // Fallback to manual parsing of Cookie header
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = {};
  cookieHeader.split(';').forEach(c => {
    const parts = c.split('=');
    const key = parts.shift().trim();
    const val = parts.join('=').trim();
    cookies[key] = val;
  });

  return cookies['admin_session'] || null;
}

/**
 * Middleware helper that verifies authentication.
 * Throws an error with statusCode 401 if invalid.
 */
export function requireAuth(req) {
  const token = extractToken(req);
  if (!token) {
    const err = new Error('Unauthorized: Session token missing.');
    err.statusCode = 401;
    throw err;
  }

  try {
    const decoded = verifyToken(token);
    return decoded;
  } catch (err) {
    const authErr = new Error('Unauthorized: ' + err.message);
    authErr.statusCode = 401;
    throw authErr;
  }
}
