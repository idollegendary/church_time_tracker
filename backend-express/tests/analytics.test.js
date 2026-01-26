const request = require('supertest');
const app = require('../src/app');

// Analytics tests; expect DB populated by previous tests or fixtures.

describe('analytics', () => {
  test('summary returns array', async () => {
    const res = await request(app).get('/api/analytics/summary');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  test('time-series returns array', async () => {
    const res = await request(app).get('/api/analytics/time-series');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
