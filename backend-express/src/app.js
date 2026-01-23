const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');
const preachersRoutes = require('./routes/preachers');
const churchesRoutes = require('./routes/churches');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve API documentation (Swagger UI)
try {
  const swaggerUi = require('swagger-ui-express');
  const openapiSpec = require('./docs/openapi.json');
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
} catch (e) {
  console.warn('Swagger UI not available:', e && e.message);
}

// Fallback docs: serve spec JSON and an HTML page using CDN-hosted Swagger UI.
const fs = require('fs');
const path = require('path');
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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/preachers', preachersRoutes);
app.use('/api/churches', churchesRoutes);
app.use('/api/analytics', analyticsRoutes);

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
