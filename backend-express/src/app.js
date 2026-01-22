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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/preachers', preachersRoutes);
app.use('/api/churches', churchesRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'internal error' });
});

module.exports = app;
