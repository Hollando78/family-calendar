import { Router } from 'express';
import db from '../db.js';
import config from '../config.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const updateSubscription = db.prepare('UPDATE users SET push_subscription = ? WHERE id = ?');

router.get('/push/public-key', (_req, res) => {
  if (!config.vapidPublicKey) {
    return res.status(503).json({ error: 'Push not configured' });
  }
  return res.json({ publicKey: config.vapidPublicKey });
});

router.post('/push/subscribe', requireAuth, (req, res) => {
  const subscription = req.body?.subscription;
  if (!subscription) {
    return res.status(400).json({ error: 'Missing subscription payload' });
  }
  updateSubscription.run(JSON.stringify(subscription), req.user.userId);
  return res.json({ ok: true });
});

export default router;
