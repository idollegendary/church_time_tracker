const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');

const { createSession, listSessions, getSessionById, updateSession, deleteSession } = require('../models/session');
const { v4: uuidv4 } = require('uuid');

function isoNow() { return new Date().toISOString(); }

// Create session
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const id = uuidv4();
  const s = await createSession({ id, church_id: payload.church_id, preacher_id: payload.preacher_id, start_at: payload.start_at, end_at: payload.end_at, service_type: payload.service_type, notes: payload.notes });
  res.status(201).json(s);
}));

// List sessions
router.get('/', asyncHandler(async (req, res) => {
  const preacher_id = req.query.preacher_id || null;
  const from = req.query.from_ || null;
  const to = req.query.to || null;
  const church_id = req.query.church_id || null;
  const items = await listSessions({ preacher_id, from, to, church_id });
  res.json(items);
}));

// Start
router.post('/:id/start', requireAuth, asyncHandler(async (req, res) => {
  const s = await getSessionById(req.params.id);
  if (!s) return res.status(404).json({ error: 'session not found' });
  const now = isoNow();
  const updated = await updateSession(req.params.id, { start_at: now });
  // recalc duration if end_at present
  if (updated.start_at && updated.end_at) {
    const dur = Math.floor((new Date(updated.end_at) - new Date(updated.start_at))/1000);
    await updateSession(req.params.id, { duration_sec: dur });
  }
  const final = await getSessionById(req.params.id);
  res.json(final);
}));

// Stop
router.post('/:id/stop', requireAuth, asyncHandler(async (req, res) => {
  const s = await getSessionById(req.params.id);
  if (!s) return res.status(404).json({ error: 'session not found' });
  const now = isoNow();
  const updated = await updateSession(req.params.id, { end_at: now });
  if (updated.start_at && updated.end_at) {
    const dur = Math.floor((new Date(updated.end_at) - new Date(updated.start_at))/1000);
    await updateSession(req.params.id, { duration_sec: dur });
  }
  const final = await getSessionById(req.params.id);
  res.json(final);
}));

// Delete (admin)
router.delete('/:id', requireAdmin, asyncHandler(async (req, res) => {
  const s = await getSessionById(req.params.id);
  if (!s) return res.status(404).json({ error: 'session not found' });
  await deleteSession(req.params.id);
  res.json({ status: 'ok' });
}));

module.exports = router;
