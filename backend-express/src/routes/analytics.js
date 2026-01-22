const express = require('express');
const { query } = require('../db');

const router = express.Router();

router.get('/summary', async (req, res) => {
  const { from_, to, church_id } = req.query;
  const clauses = [];
  const params = [];
  let idx = 1;
  if (church_id) { clauses.push(`church_id = $${idx++}`); params.push(church_id); }
  if (from_) { clauses.push(`start_at >= $${idx++}`); params.push(from_); }
  if (to) { clauses.push(`start_at < $${idx++}`); params.push(to); }
  clauses.push(`start_at IS NOT NULL`);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT preacher_id, COALESCE(SUM(duration_sec),0)::bigint AS total_sec, COUNT(id)::int AS sessions_count FROM sessions ${where} GROUP BY preacher_id ORDER BY SUM(duration_sec) DESC`;
  const resq = await query(sql, params);
  const rows = resq.rows.map(r => ({ preacher_id: r.preacher_id, total_sec: Number(r.total_sec || 0), sessions_count: Number(r.sessions_count || 0) }));
  res.json(rows);
});

router.get('/time-series', async (req, res) => {
  const { preacher_id, from_, to, church_id, granularity = 'day' } = req.query;
  if (granularity !== 'day') return res.status(400).json({ error: 'only day granularity supported' });
  const clauses = [];
  const params = [];
  let idx = 1;
  if (preacher_id) { clauses.push(`preacher_id = $${idx++}`); params.push(preacher_id); }
  if (church_id) { clauses.push(`church_id = $${idx++}`); params.push(church_id); }
  if (from_) { clauses.push(`start_at >= $${idx++}`); params.push(from_); }
  if (to) { clauses.push(`start_at < $${idx++}`); params.push(to); }
  clauses.push(`start_at IS NOT NULL`);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT to_char(date_trunc('day', start_at), 'YYYY-MM-DD') AS day, COALESCE(SUM(duration_sec),0)::bigint AS total_sec FROM sessions ${where} GROUP BY day ORDER BY day`;
  const resq = await query(sql, params);
  const rows = resq.rows.filter(r => r.day !== null).map(r => ({ day: r.day, total_sec: Number(r.total_sec || 0) }));
  res.json(rows);
});

router.get('/top', async (req, res) => {
  const { limit = 10, from_, to, church_id } = req.query;
  const clauses = [];
  const params = [];
  let idx = 1;
  if (church_id) { clauses.push(`church_id = $${idx++}`); params.push(church_id); }
  if (from_) { clauses.push(`start_at >= $${idx++}`); params.push(from_); }
  if (to) { clauses.push(`start_at < $${idx++}`); params.push(to); }
  clauses.push(`start_at IS NOT NULL`);
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT preacher_id, COALESCE(SUM(duration_sec),0)::bigint AS total_sec, COUNT(id)::int AS sessions_count FROM sessions ${where} GROUP BY preacher_id ORDER BY SUM(duration_sec) DESC LIMIT $${idx}`;
  params.push(limit);
  const resq = await query(sql, params);
  const rows = resq.rows.map(r => ({ preacher_id: r.preacher_id, total_sec: Number(r.total_sec || 0), sessions_count: Number(r.sessions_count || 0) }));
  res.json(rows);
});

router.get('/shortest', async (req, res) => {
  const { limit = 10, church_id } = req.query;
  const params = [limit];
  let sql = `SELECT id, preacher_id, duration_sec, start_at, end_at FROM sessions WHERE duration_sec IS NOT NULL`;
  if (church_id) { sql += ' AND church_id = $2'; params.push(church_id); }
  sql += ' ORDER BY duration_sec ASC LIMIT $1';
  // Note: parameter order handled above; simpler to query without param juggling for now
  const resq = await query(sql, params);
  const rows = resq.rows.map(r => ({ id: r.id, preacher_id: r.preacher_id, duration_sec: r.duration_sec, start_at: r.start_at ? r.start_at.toISOString() : null, end_at: r.end_at ? r.end_at.toISOString() : null }));
  res.json(rows);
});

router.get('/overlap', async (req, res) => {
  const { limit = 50, church_id } = req.query;
  let where_clause = '';
  if (church_id) { where_clause = `AND s1.church_id = $1 AND s2.church_id = $1`; }
  const sql = `
    SELECT s1.id as session_a, s2.id as session_b,
      GREATEST(0, EXTRACT(EPOCH FROM LEAST(s1.end_at, s2.end_at) - GREATEST(s1.start_at, s2.start_at)))::int as overlap_sec
    FROM sessions s1
    JOIN sessions s2 ON s1.id < s2.id
    WHERE s1.end_at IS NOT NULL AND s2.end_at IS NOT NULL
      AND s1.start_at < s2.end_at AND s2.start_at < s1.end_at
      ${where_clause}
    ORDER BY overlap_sec DESC
    LIMIT $${church_id ? 2 : 1}
  `;
  const params = [];
  if (church_id) params.push(church_id);
  params.push(limit);
  try {
    const resq = await query(sql, params);
    const rows = resq.rows.map(r => ({ session_a: r.session_a, session_b: r.session_b, overlap_sec: Number(r.overlap_sec || 0) }));
    res.json(rows);
  } catch (e) {
    res.json({ error: String(e) });
  }
});

module.exports = router;
