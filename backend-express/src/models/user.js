const { query } = require('../db');

async function createUser({ id, login, email = null, name = null, password_hash, role = 'user' }) {
  const sql = `INSERT INTO users (id, login, email, name, password_hash, role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const res = await query(sql, [id, login, email, name, password_hash, role]);
  return res.rows[0];
}

async function getUserByLogin(login) {
  const res = await query('SELECT * FROM users WHERE login = $1 LIMIT 1', [login]);
  return res.rows[0] || null;
}

async function getUserById(id) {
  const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
}

module.exports = { createUser, getUserByLogin, getUserById };
