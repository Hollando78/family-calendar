import { Router } from 'express';
import db from '../db.js';
import { signToken } from '../middleware/auth.js';
import { generateJoinCode } from '../utils/helpers.js';

const router = Router();

const findFamilyByCode = db.prepare('SELECT * FROM families WHERE join_code = ?');
const insertFamily = db.prepare('INSERT INTO families (name, join_code) VALUES (?, ?)');
const findUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const insertUser = db.prepare('INSERT INTO users (name, email, color) VALUES (?, ?, ?)');
const updateUser = db.prepare('UPDATE users SET name = ?, color = ? WHERE id = ?');
const insertMembership = db.prepare('INSERT OR IGNORE INTO family_members (family_id, user_id) VALUES (?, ?)');

router.post('/auth/join-family', (req, res) => {
  const { joinCode = '', familyName = '', memberName = '', email = '', color = '' } = req.body || {};

  if (!memberName.trim()) {
    return res.status(400).json({ error: 'Member name is required' });
  }

  let family;

  if (joinCode.trim()) {
    family = findFamilyByCode.get(joinCode.trim().toUpperCase());
    if (!family) {
      return res.status(404).json({ error: 'Family code not found' });
    }
  } else {
    const name = familyName.trim() || `${memberName.trim()}'s family`;
    let newCode = generateJoinCode();
    while (findFamilyByCode.get(newCode)) {
      newCode = generateJoinCode();
    }
    const result = insertFamily.run(name, newCode);
    family = { id: Number(result.lastInsertRowid), name, join_code: newCode };
  }

  let user = email ? findUserByEmail.get(email.trim().toLowerCase()) : null;
  if (user) {
    updateUser.run(memberName.trim(), color.trim() || user.color, user.id);
    user = { ...user, name: memberName.trim(), color: color.trim() || user.color };
  } else {
    const result = insertUser.run(memberName.trim(), email.trim().toLowerCase() || null, color.trim() || null);
    user = {
      id: Number(result.lastInsertRowid),
      name: memberName.trim(),
      email: email.trim() || null,
      color: color.trim() || null
    };
  }

  insertMembership.run(family.id, user.id);

  const token = signToken({ userId: user.id, familyId: family.id });

  return res.json({
    token,
    family: {
      id: family.id,
      name: family.name,
      joinCode: family.join_code
    },
    user
  });
});

export default router;
