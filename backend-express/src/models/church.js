const { query } = require('../db');

async function createChurch({ id, name, timezone = 'UTC' }) {
  const sql = `INSERT INTO churches (id, name, timezone) VALUES ($1,$2,$3) RETURNING *`;
  const res = await query(sql, [id, name, timezone]);
  return res.rows[0];
}

async function listChurches() {
  const res = await query('SELECT * FROM churches ORDER BY created_at DESC');
  return res.rows;
}

async function getChurchById(id) {
  const res = await query('SELECT * FROM churches WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
}

async function deleteChurch(id) {
  await query('DELETE FROM churches WHERE id = $1', [id]);
}

module.exports = { createChurch, listChurches, getChurchById, deleteChurch };
