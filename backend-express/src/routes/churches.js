const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { createChurch, listChurches, getChurchById, deleteChurch } = require('../models/church');
const { listPreachers } = require('../models/preacher');

router.post('/', requireAuth, async (req, res) => {
  const payload = req.body || {};
  if (!payload.name) return res.status(400).json({ error: 'name required' });
  const id = uuidv4();
  const c = await createChurch({ id, name: payload.name, timezone: payload.timezone || 'UTC' });
  res.status(201).json(c);
});

router.get('/', async (req, res) => {
  const items = await listChurches();
  res.json(items);
});

router.get('/:id/preachers', async (req, res) => {
  const preachers = await listPreachers({ church_id: req.params.id });
  res.json(preachers);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const c = await getChurchById(req.params.id);
  if (!c) return res.status(404).json({ error: 'church not found' });
  await deleteChurch(req.params.id);
  res.json({ status: 'ok' });
});

module.exports = router;
