const { query } = require('../db');

async function createSession({ id, church_id = null, preacher_id = null, start_at = null, end_at = null, service_type = null, notes = null }) {
  const sql = `INSERT INTO sessions (id, church_id, preacher_id, start_at, end_at, service_type, notes, duration_sec) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
  let duration = null;
  if (start_at && end_at) duration = Math.floor((new Date(end_at) - new Date(start_at)) / 1000);
  const res = await query(sql, [id, church_id, preacher_id, start_at, end_at, service_type, notes, duration]);
  return res.rows[0];
}

async function listSessions({ preacher_id = null, from = null, to = null, church_id = null }) {
  let clauses = [];
  let params = [];
  let idx = 1;
  if (preacher_id) { clauses.push(`preacher_id = $${idx++}`); params.push(preacher_id); }
  if (church_id) { clauses.push(`church_id = $${idx++}`); params.push(church_id); }
  if (from) { clauses.push(`start_at >= $${idx++}`); params.push(from); }
  if (to) { clauses.push(`start_at < $${idx++}`); params.push(to); }
  clauses.push(`start_at IS NOT NULL`);

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT * FROM sessions ${where} ORDER BY created_at DESC`;
  const res = await query(sql, params);
  return res.rows;
}

async function getSessionById(id) {
  const res = await query('SELECT * FROM sessions WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
}

async function updateSession(id, patch) {
  const fields = [];
  const params = [];
  let idx = 1;
  for (const k of Object.keys(patch)) {
    fields.push(`${k} = $${idx++}`);
    params.push(patch[k]);
  }
  if (fields.length === 0) return getSessionById(id);
  params.push(id);
  const sql = `UPDATE sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const res = await query(sql, params);
  return res.rows[0];
}

async function deleteSession(id) {
  await query('DELETE FROM sessions WHERE id = $1', [id]);
}

module.exports = { createSession, listSessions, getSessionById, updateSession, deleteSession };
