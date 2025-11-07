import express from 'express';
import cors from 'cors';
import config from './config.js';
import './db.js';
import apiRouter from './routes/index.js';
import { startDigestScheduler } from './scheduler/digests.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use('/api', apiRouter);

const server = app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});

startDigestScheduler();

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
