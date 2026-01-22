const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');
const { endPool } = require('./db');

dotenv.config();

const PORT = process.env.PORT || 8000;

function maskConn(s) {
  if (!s) return '<missing>';
  // hide credentials
  try {
    return s.replace(/(postgres:\/\/)([^:@]+):([^@]+)@/, '$1<user>:<pass>@');
  } catch (_) {
    return '<masked>';
  }
}

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Trecker Time Express backend listening on port ${PORT}`);
  console.log(`NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  console.log(`DATABASE_URL=${maskConn(process.env.DATABASE_URL)}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception —', err && err.stack ? err.stack : err);
  // attempt graceful shutdown
  shutdown(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection —', reason);
  // attempt graceful shutdown
  shutdown(1);
});

function shutdown(code = 0) {
  console.log('Shutting down server...');
  server.close(async () => {
    try {
      await endPool();
      console.log('DB pool closed');
    } catch (e) {
      console.error('Error closing DB pool', e);
    }
    process.exit(code);
  });
  // if server doesn't close in 5s, force exit
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(code);
  }, 5000).unref();
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
