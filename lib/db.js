import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

// Determine if SSL is required. Enable SSL for non-localhost/non-local-IP hosted databases (like Neon / Vercel Postgres)
const isLocalhost = connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'));
const ssl = connectionString && !isLocalhost ? { rejectUnauthorized: false } : false;

export const pool = new Pool({
  connectionString,
  ssl,
  max: 10, // Max clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper for single queries
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Executed query in ${duration}ms`, { text, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', { text, err });
    throw err;
  }
}
