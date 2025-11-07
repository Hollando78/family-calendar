import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { expandEvents, mapEventRow } from '../services/eventsService.js';

const router = Router();

const getEvents = db.prepare('SELECT * FROM events WHERE family_id = ? ORDER BY date ASC, time ASC');
const getEventById = db.prepare('SELECT * FROM events WHERE id = ? AND family_id = ?');
const insertEvent = db.prepare(`
  INSERT INTO events (family_id, created_by, title, description, date, time, repeat_rule, all_day, member_id, location)
  VALUES (@family_id, @created_by, @title, @description, @date, @time, @repeat_rule, @all_day, @member_id, @location)
`);
const updateEventStmt = db.prepare(`
  UPDATE events
  SET title = @title,
      description = @description,
      date = @date,
      time = @time,
      repeat_rule = @repeat_rule,
      all_day = @all_day,
      member_id = @member_id,
      location = @location
  WHERE id = @id AND family_id = @family_id
`);
const deleteEventStmt = db.prepare('DELETE FROM events WHERE id = ? AND family_id = ?');

router.get('/events', requireAuth, (req, res) => {
  const { from, to } = req.query;
  const rows = getEvents.all(req.user.familyId);
  const events = expandEvents(rows, from, to).sort((a, b) => (`${a.date} ${a.time || ''}`).localeCompare(`${b.date} ${b.time || ''}`));
  res.json({ events });
});

router.post('/events', requireAuth, (req, res) => {
  const {
    title,
    date,
    time = null,
    description = null,
    repeatRule = null,
    allDay = false,
    memberId = null,
    location = null
  } = req.body || {};

  if (!title || !date) {
    return res.status(400).json({ error: 'Title and date are required' });
  }

  const sanitizedRule = repeatRule && repeatRule.type !== 'none' ? JSON.stringify(repeatRule) : null;
  const result = insertEvent.run({
    family_id: req.user.familyId,
    created_by: req.user.userId,
    title: title.trim(),
    description: description?.trim() || null,
    date,
    time,
    repeat_rule: sanitizedRule,
    all_day: allDay ? 1 : 0,
    member_id: memberId || null,
    location: location?.trim() || null
  });

  const created = getEventById.get(result.lastInsertRowid, req.user.familyId);
  res.status(201).json({ event: mapEventRow(created) });
});

router.put('/events/:id', requireAuth, (req, res) => {
  const event = getEventById.get(req.params.id, req.user.familyId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const hasRepeatRule = Object.prototype.hasOwnProperty.call(req.body, 'repeatRule');
  const sanitizedRepeatRule = hasRepeatRule
    ? (req.body.repeatRule && req.body.repeatRule.type !== 'none' ? JSON.stringify(req.body.repeatRule) : null)
    : event.repeat_rule;
  const payload = {
    id: event.id,
    family_id: req.user.familyId,
    title: req.body.title?.trim() || event.title,
    description: req.body.description?.trim() ?? event.description,
    date: req.body.date || event.date,
    time: req.body.time ?? event.time,
    repeat_rule: sanitizedRepeatRule,
    all_day: req.body.allDay !== undefined ? (req.body.allDay ? 1 : 0) : event.all_day,
    member_id: req.body.memberId ?? event.member_id,
    location: req.body.location?.trim() ?? event.location
  };

  updateEventStmt.run(payload);
  const updated = getEventById.get(event.id, req.user.familyId);
  res.json({ event: mapEventRow(updated) });
});

router.delete('/events/:id', requireAuth, (req, res) => {
  const info = deleteEventStmt.run(req.params.id, req.user.familyId);
  if (info.changes === 0) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.status(204).send();
});

export default router;
