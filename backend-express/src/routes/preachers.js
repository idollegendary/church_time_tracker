const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { v4: uuidv4 } = require('uuid');
const { createPreacher, listPreachers, getPreacherById, updatePreacher, deletePreacher } = require('../models/preacher');

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const payload = req.body || {};
  if (!payload.name) return res.status(400).json({ error: 'name required' });
  const id = uuidv4();
  const p = await createPreacher({ id, name: payload.name, church_id: payload.church_id || null, avatar_url: payload.avatar_url || null });
  res.status(201).json(p);
}));

router.get('/', asyncHandler(async (req, res) => {
  const church_id = req.query.church_id || null;
  const items = await listPreachers({ church_id });
  res.json(items);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const p = await getPreacherById(req.params.id);
  if (!p) return res.status(404).json({ error: 'preacher not found' });
  res.json(p);
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const update = req.body || {};
  const p = await getPreacherById(req.params.id);
  if (!p) return res.status(404).json({ error: 'preacher not found' });
  const updated = await updatePreacher(req.params.id, update);
  res.json(updated);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const p = await getPreacherById(req.params.id);
  if (!p) return res.status(404).json({ error: 'preacher not found' });
  await deletePreacher(req.params.id);
  res.json({ status: 'ok' });
}));

module.exports = router;
