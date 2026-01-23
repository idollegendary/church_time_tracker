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
