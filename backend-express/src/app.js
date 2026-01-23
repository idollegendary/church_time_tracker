const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');
const preachersRoutes = require('./routes/preachers');
const churchesRoutes = require('./routes/churches');
const analyticsRoutes = require('./routes/analytics');
const badgesRoutes = require('./routes/badges');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Relax Content Security Policy for docs routes so CDN-hosted Swagger UI can load.
app.use((req, res, next) => {
  try {
    if (req.path === '/api/docs' || req.path.startsWith('/api/docs/') || req.path === '/docs' || req.path.startsWith('/docs/')) {
      // Allow loading scripts/styles from https and blobs, and allow inline styles/scripts for the docs page only.
      res.setHeader('Content-Security-Policy', "default-src 'self' https: data:; img-src 'self' data:; style-src 'self' https: 'unsafe-inline'; script-src 'self' https: 'unsafe-inline' blob:;");
    }
  } catch (e) {
    // ignore
  }
  next();
});

// Fallback docs: serve spec JSON and an HTML page using CDN-hosted Swagger UI.
const fs = require('fs');
const path = require('path');

// Serve spec before any Swagger middleware to ensure JSON is returned.
app.get('/api/docs/spec', (req, res) => {
  const p = path.join(__dirname, 'docs', 'openapi.json');
  if (fs.existsSync(p)) {
    try {
      const spec = fs.readFileSync(p, 'utf8');
      res.type('application/json').send(spec);
      return;
    } catch (err) {
      console.warn('Failed to read openapi.json:', err && err.message);
    }
  }
  res.status(404).json({ error: 'OpenAPI spec not found' });
});

app.get('/api/docs', (req, res) => {
  // Minimal HTML that loads Swagger UI from CDN and points to /api/docs/spec
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: '/api/docs/spec',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout'
        });
      };
    </script>
  </body>
</html>`;
  res.type('text/html').send(html);
});

// Also serve docs at /docs (non-API path) to avoid platform rewrite issues.
app.get('/docs/spec', (req, res) => {
  const p = path.join(__dirname, 'docs', 'openapi.json');
  if (fs.existsSync(p)) {
    try {
      const spec = fs.readFileSync(p, 'utf8');
      res.type('application/json').send(spec);
      return;
    } catch (err) {
      console.warn('Failed to read openapi.json:', err && err.message);
    }
  }
  res.status(404).json({ error: 'OpenAPI spec not found' });
});

app.get('/docs', (req, res) => {
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function() {
        SwaggerUIBundle({
          url: '/docs/spec',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis],
          layout: 'BaseLayout'
        });
      };
    </script>
  </body>
</html>`;
  res.type('text/html').send(html);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/preachers', preachersRoutes);
app.use('/api/churches', churchesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/badges', badgesRoutes);

app.use((err, req, res, next) => {
  try {
    console.error('Error handling request', {
      method: req.method,
      path: req.originalUrl,
      body: req.body,
      message: err && err.message,
      stack: err && err.stack,
    });
  } catch (e) {
    console.error('Error logging failed', e);
  }
  res.status(err.status || 500).json({ error: err.message || 'internal error' });
});

module.exports = app;
