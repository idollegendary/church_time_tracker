const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let pool = null;
if (connectionString) {
  pool = new Pool({ connectionString });
}

async function query(text, params) {
  if (!pool) throw new Error('DATABASE_URL not configured');
  const res = await pool.query(text, params);
  return res;
}

async function testConnection() {
  if (!pool) throw new Error('DATABASE_URL not configured');
  const res = await pool.query('SELECT 1');
  return res.rowCount === 1;
}

module.exports = { pool, query, testConnection };

async function endPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports.endPool = endPool;
