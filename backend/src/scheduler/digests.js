import cron from 'node-cron';
import webpush from 'web-push';
import { DateTime } from 'luxon';
import config from '../config.js';
import db from '../db.js';
import { expandEvents, summarizeEvents } from '../services/eventsService.js';

const listFamilies = db.prepare('SELECT id FROM families');
const listMembers = db.prepare(`
  SELECT u.id, u.name, u.push_subscription
  FROM family_members fm
  JOIN users u ON u.id = fm.user_id
  WHERE fm.family_id = ?
`);
const listEvents = db.prepare('SELECT * FROM events WHERE family_id = ?');

function buildRange(daysFromToday) {
  const target = DateTime.local().plus({ days: daysFromToday }).toISODate();
  return { from: target, to: target };
}

async function dispatchToMember(member, payload) {
  if (!member.push_subscription) {
    return;
  }

  try {
    const subscription = JSON.parse(member.push_subscription);
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error('Push delivery failed', err.message);
  }
}

async function sendDigest(daysAhead) {
  const range = buildRange(daysAhead);
  const families = listFamilies.all();
  await Promise.all(families.map(async (family) => {
    const events = expandEvents(listEvents.all(family.id), range.from, range.to);
    if (!events.length) {
      return;
    }
    const summary = summarizeEvents(events);
    const members = listMembers.all(family.id);
    const payload = {
      title: daysAhead === 0 ? "Today's family schedule" : "Tomorrow's family schedule",
      body: summary,
      url: '/'
    };
    await Promise.all(members.map((member) => dispatchToMember(member, payload)));
  }));
}

export function startDigestScheduler() {
  if (!config.vapidPublicKey || !config.vapidPrivateKey) {
    console.warn('VAPID keys missing; push scheduler disabled');
    return;
  }

  webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey);

  cron.schedule('0 7 * * *', () => {
    sendDigest(0).catch((err) => console.error('Morning digest failed', err));
  });

  cron.schedule('0 20 * * *', () => {
    sendDigest(1).catch((err) => console.error('Evening digest failed', err));
  });

  console.info('Push digest scheduler ready (07:00 + 20:00).');
}
