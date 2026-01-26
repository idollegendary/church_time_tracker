const request = require('supertest');
const app = require('../src/app');

// These tests expect a running DB and will create temporary records.

describe('sessions', () => {
  const login = `testuser_${Date.now()}`;
  const password = 'password123';
  let token;
  let sessionId;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({ login, password, name: 'T' });
    const r = await request(app).post('/api/auth/login').send({ login, password });
    token = r.body.access_token;
  });

  test('create and list sessions', async () => {
    const create = await request(app).post('/api/sessions').set('Authorization', `Bearer ${token}`).send({ service_type: 'test' });
    expect(create.statusCode).toBe(201);
    expect(create.body).toHaveProperty('id');
    sessionId = create.body.id;

    const list = await request(app).get('/api/sessions');
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body)).toBeTruthy();
  });

  test('start and stop session', async () => {
    const start = await request(app).post(`/api/sessions/${sessionId}/start`).set('Authorization', `Bearer ${token}`).send();
    expect(start.statusCode).toBe(200);
    const stop = await request(app).post(`/api/sessions/${sessionId}/stop`).set('Authorization', `Bearer ${token}`).send();
    expect(stop.statusCode).toBe(200);
    expect(stop.body).toHaveProperty('duration_sec');
  });
});
