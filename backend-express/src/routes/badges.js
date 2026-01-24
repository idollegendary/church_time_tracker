const express = require('express');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const { createBadge, listBadges, getBadgeById, updateBadge, deleteBadge, assignBadge, unassignBadge, listAssignments } = require('../models/badge');

const router = express.Router();

// List badges
router.get('/', asyncHandler(async (req, res) => {
  const items = await listBadges();
  res.json(items);
}));

// Create badge (admin)
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const payload = req.body || {};
  if(!payload.label) return res.status(400).json({ error: 'label required' });
  const id = uuidv4();
  const b = await createBadge({ id, label: payload.label, emoji: payload.emoji || '🏅', color: payload.color || 'text-yellow-600' });
  res.status(201).json(b);
}));

// Update badge
router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const p = await getBadgeById(req.params.id);
  if(!p) return res.status(404).json({ error: 'badge not found' });
  const updated = await updateBadge(req.params.id, req.body || {});
  res.json(updated);
}));

// Delete badge
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const p = await getBadgeById(req.params.id);
  if(!p) return res.status(404).json({ error: 'badge not found' });
  await deleteBadge(req.params.id);
  res.json({ status: 'ok' });
}));

// List assignments
router.get('/assignments', asyncHandler(async (req, res) => {
  const map = await listAssignments();
  res.json(map);
}));

// Assign badge to preacher
router.post('/assign', requireAuth, asyncHandler(async (req, res) => {
  const payload = req.body || {};
  if(!payload.preacher_id || !payload.badge_id) return res.status(400).json({ error: 'preacher_id and badge_id required' });
  await assignBadge(payload.preacher_id, payload.badge_id, req.user?.id || null);
  const map = await listAssignments();
  res.status(201).json(map);
}));

// Unassign
router.delete('/assign', requireAuth, asyncHandler(async (req, res) => {
  const preacher_id = req.query.preacher_id;
  const badge_id = req.query.badge_id;
  if(!preacher_id || !badge_id) return res.status(400).json({ error: 'preacher_id and badge_id required' });
  await unassignBadge(preacher_id, badge_id);
  const map = await listAssignments();
  res.json(map);
}));

// Unassign via POST with JSON body — convenience endpoint (some clients/hosts may not support DELETE reliably)
router.post('/unassign', requireAuth, asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const preacher_id = payload.preacher_id;
  const badge_id = payload.badge_id;
  if(!preacher_id || !badge_id) return res.status(400).json({ error: 'preacher_id and badge_id required' });
  await unassignBadge(preacher_id, badge_id);
  const map = await listAssignments();
  res.json(map);
}));

module.exports = router;
