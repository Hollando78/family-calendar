import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const getUser = db.prepare('SELECT id, name, email, color, push_subscription FROM users WHERE id = ?');
const getFamily = db.prepare('SELECT id, name, join_code FROM families WHERE id = ?');
const getMembers = db.prepare(`
  SELECT u.id, u.name, u.color, u.email
  FROM family_members fm
  JOIN users u ON u.id = fm.user_id
  WHERE fm.family_id = ?
  ORDER BY u.name ASC
`);

router.get('/me', requireAuth, (req, res) => {
  const user = getUser.get(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const family = getFamily.get(req.user.familyId);
  if (!family) {
    return res.status(404).json({ error: 'Family not found' });
  }

  const members = getMembers.all(req.user.familyId);

  return res.json({
    user,
    family: {
      id: family.id,
      name: family.name,
      joinCode: family.join_code
    },
    members
  });
});

export default router;
