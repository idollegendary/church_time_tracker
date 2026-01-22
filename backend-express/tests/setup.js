const { endPool } = require('../src/db');

afterAll(async () => {
  try {
    await endPool();
  } catch (e) {
    // ignore
  }
});
