const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let pool = null;
let dbError = null;

// Validate connection string early to provide a clearer error when misconfigured
if (connectionString) {
  try {
    const u = new URL(connectionString);
    const host = u.hostname;
    if (!host || host === 'base') {
      dbError = `Invalid DATABASE_URL host: ${host || '<empty>'}`;
      console.error('DB config validation failed:', dbError);
    } else {
      pool = new Pool({ connectionString });
    }
  } catch (e) {
    dbError = `Cannot parse DATABASE_URL: ${String(e.message)}`;
    console.error('DB config validation failed:', dbError);
  }
} else {
  dbError = 'DATABASE_URL not configured';
  console.error(dbError);
}

async function query(text, params) {
  if (dbError) {
    const err = new Error(dbError);
    err.code = 'DB_CONFIG_ERROR';
    throw err;
  }
  if (!pool) {
    const err = new Error('Database pool not available');
    err.code = 'DB_NO_POOL';
    throw err;
  }
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (e) {
    // Normalize DNS/connection errors so callers can react without crashing
    if (/getaddrinfo|ENOTFOUND/.test(String(e.message)) || e.code === 'ENOTFOUND') {
      e.code = 'DB_UNREACHABLE';
    }
    throw e;
  }
}

async function testConnection() {
  if (dbError) {
    const err = new Error(dbError);
    err.code = 'DB_CONFIG_ERROR';
    throw err;
  }
  if (!pool) throw new Error('Database pool not available');
  const res = await pool.query('SELECT 1');
  return res.rowCount === 1;
}

module.exports = { pool, query, testConnection, dbError };

async function endPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports.endPool = endPool;
