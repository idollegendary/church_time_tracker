const { pool } = require('./index');

async function migrate() {
  if (!pool) {
    console.error('No DATABASE_URL configured; set it in .env');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        login VARCHAR UNIQUE NOT NULL,
        email VARCHAR,
        name VARCHAR,
        password_hash TEXT NOT NULL,
        role VARCHAR NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS churches (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        timezone VARCHAR DEFAULT 'UTC',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS preachers (
        id VARCHAR PRIMARY KEY,
        name VARCHAR NOT NULL,
        church_id VARCHAR,
        avatar_url TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR PRIMARY KEY,
        church_id VARCHAR,
        preacher_id VARCHAR,
        start_at TIMESTAMP WITH TIME ZONE,
        end_at TIMESTAMP WITH TIME ZONE,
        service_type VARCHAR,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        duration_sec INTEGER
      )
    `);

    await client.query('COMMIT');
    console.log('Migrations applied');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed', err);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
