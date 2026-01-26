const { query } = require('../db');

async function createPreacher({ id, name, church_id = null, avatar_url = null }) {
  const sql = `INSERT INTO preachers (id, name, church_id, avatar_url) VALUES ($1,$2,$3,$4) RETURNING *`;
  const res = await query(sql, [id, name, church_id, avatar_url]);
  return res.rows[0];
}

async function listPreachers({ church_id = null } = {}) {
  if (church_id) {
    const res = await query('SELECT * FROM preachers WHERE church_id = $1', [church_id]);
    return res.rows;
  }
  const res = await query('SELECT * FROM preachers');
  return res.rows;
}

async function getPreacherById(id) {
  const res = await query('SELECT * FROM preachers WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
}

async function updatePreacher(id, patch) {
  const fields = [];
  const params = [];
  let idx = 1;
  for (const k of Object.keys(patch)) {
    fields.push(`${k} = $${idx++}`);
    params.push(patch[k]);
  }
  if (fields.length === 0) return getPreacherById(id);
  params.push(id);
  const sql = `UPDATE preachers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const res = await query(sql, params);
  return res.rows[0];
}

async function deletePreacher(id) {
  await query('DELETE FROM preachers WHERE id = $1', [id]);
}

module.exports = { createPreacher, listPreachers, getPreacherById, updatePreacher, deletePreacher };
