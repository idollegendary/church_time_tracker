#!/usr/bin/env node
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getUserByLogin, createUser } = require('../src/models/user');

dotenv.config();

async function main() {
  const argLogin = process.argv[2];
  const argPassword = process.argv[3];

  const login = argLogin || process.env.ADMIN_LOGIN || 'admin';
  const password = argPassword || process.env.ADMIN_PASSWORD || 'admin';

  try {
    const existing = await getUserByLogin(login);
    if (existing) {
      console.log(`User already exists: ${login} (id=${existing.id}, role=${existing.role})`);
      process.exit(0);
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    const user = await createUser({ id, login, password_hash, role: 'admin' });
    console.log(`Created admin user: ${login} (id=${user.id})`);
    process.exit(0);
  } catch (e) {
    console.error('Failed to create admin user:', e && e.message ? e.message : e);
    process.exit(2);
  }
}

main();
