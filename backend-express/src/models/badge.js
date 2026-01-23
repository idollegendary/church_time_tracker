const { query } = require('../db');

async function createBadge({ id, label, emoji = '🏅', color = 'text-yellow-600' }){
  const res = await query('INSERT INTO badges (id, label, emoji, color) VALUES ($1,$2,$3,$4) RETURNING *', [id, label, emoji, color]);
  return res.rows[0];
}

async function listBadges(){
  const res = await query('SELECT * FROM badges ORDER BY created_at DESC');
  return res.rows;
}

async function getBadgeById(id){
  const res = await query('SELECT * FROM badges WHERE id = $1 LIMIT 1', [id]);
  return res.rows[0] || null;
}

async function updateBadge(id, patch){
  const fields = [];
  const params = [];
  let idx = 1;
  for(const k of Object.keys(patch)){
    fields.push(`${k} = $${idx++}`);
    params.push(patch[k]);
  }
  if(fields.length === 0) return getBadgeById(id);
  params.push(id);
  const sql = `UPDATE badges SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
  const res = await query(sql, params);
  return res.rows[0];
}

async function deleteBadge(id){
  // remove assignments first
  await query('DELETE FROM badge_assignments WHERE badge_id = $1', [id]);
  await query('DELETE FROM badges WHERE id = $1', [id]);
}

async function assignBadge(preacherId, badgeId, assignedBy = null){
  await query('INSERT INTO badge_assignments (preacher_id, badge_id, assigned_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [preacherId, badgeId, assignedBy]);
}

async function unassignBadge(preacherId, badgeId){
  await query('DELETE FROM badge_assignments WHERE preacher_id = $1 AND badge_id = $2', [preacherId, badgeId]);
}

async function listAssignments(){
  const res = await query('SELECT preacher_id, badge_id FROM badge_assignments');
  // convert to map
  const map = {};
  for(const r of res.rows){
    map[r.preacher_id] = map[r.preacher_id] || [];
    map[r.preacher_id].push(r.badge_id);
  }
  return map;
}

module.exports = { createBadge, listBadges, getBadgeById, updateBadge, deleteBadge, assignBadge, unassignBadge, listAssignments };
