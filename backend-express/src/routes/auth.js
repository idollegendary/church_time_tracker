const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const SECRET = process.env.JWT_SECRET || 'dev-secret';

const { createUser, getUserByLogin, getUserById } = require('../models/user');
const { v4: uuidv4 } = require('uuid');

router.post('/register', asyncHandler(async (req, res) => {
  const { login, password, name } = req.body || {};
  if (!login || !password) return res.status(400).json({ error: 'login and password required' });
  try {
    const existing = await getUserByLogin(login);
    if (existing) return res.status(400).json({ error: 'login exists' });
    const pwHash = await bcrypt.hash(password, 10);
    const role = (process.env.ADMIN_LOGIN && process.env.ADMIN_LOGIN === login) ? 'admin' : 'user';
    const user = await createUser({ id: uuidv4(), login, email: null, name: name || null, password_hash: pwHash, role });
    res.json({ id: user.id, login: user.login, name: user.name, role: user.role });
  } catch (e) {
    if (e && (e.code === 'DB_CONFIG_ERROR' || e.code === 'DB_UNREACHABLE' || /getaddrinfo|ENOTFOUND/.test(String(e.message)))) {
      return res.status(503).json({ error: 'Database unavailable: check DATABASE_URL' });
    }
    throw e;
  }
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) return res.status(400).json({ error: 'login and password required' });
  try {
    const user = await getUserByLogin(login);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ user_id: user.id, role: user.role }, SECRET, { expiresIn: '60m' });
    res.json({ access_token: token, token_type: 'bearer', user: { id: user.id, login: user.login, role: user.role } });
  } catch (e) {
    if (e && (e.code === 'DB_CONFIG_ERROR' || e.code === 'DB_UNREACHABLE' || /getaddrinfo|ENOTFOUND/.test(String(e.message)))) {
      return res.status(503).json({ error: 'Database unavailable: check DATABASE_URL' });
    }
    throw e;
  }
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const payload = req.user;
  try {
    const u = await getUserById(payload.user_id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ id: u.id, login: u.login, email: u.email || null, name: u.name, role: u.role });
  } catch (e) {
    if (e && (e.code === 'DB_CONFIG_ERROR' || e.code === 'DB_UNREACHABLE' || /getaddrinfo|ENOTFOUND/.test(String(e.message)))) {
      return res.status(503).json({ error: 'Database unavailable: check DATABASE_URL' });
    }
    throw e;
  }
}));

module.exports = router;
