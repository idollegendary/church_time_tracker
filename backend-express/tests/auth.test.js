const request = require('supertest');
const app = require('../src/app');

// These tests require a running DB (DATABASE_URL) and will create a test user.
// Run locally with a test Postgres available and env DATABASE_URL pointing to it.

describe('auth', () => {
  const login = `testuser_${Date.now()}`;
  const password = 'password123';

  it('register -> login -> me', async () => {
    const r1 = await request(app).post('/api/auth/register').send({ login, password, name: 'T' });
    expect(r1.statusCode === 200 || r1.statusCode === 201).toBeTruthy();
    const r2 = await request(app).post('/api/auth/login').send({ login, password });
    expect(r2.statusCode).toBe(200);
    expect(r2.body).toHaveProperty('access_token');
    const token = r2.body.access_token;
    const r3 = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(r3.statusCode).toBe(200);
    expect(r3.body).toHaveProperty('login', login);
  });
});
