import { DateTime } from 'luxon';
import { safeJsonParse } from '../utils/helpers.js';

const MAX_OCCURRENCES = 500;

export function normalizeRange(from, to) {
  const today = DateTime.local().startOf('day');
  const start = from ? DateTime.fromISO(from).startOf('day') : today.minus({ days: 1 });
  const end = to ? DateTime.fromISO(to).endOf('day') : today.plus({ days: 14 }).endOf('day');

  if (!start.isValid || !end.isValid || end < start) {
    return { start: today, end: today.plus({ days: 14 }).endOf('day') };
  }

  return { start, end };
}

export function mapEventRow(row) {
  return {
    id: row.id,
    familyId: row.family_id,
    createdBy: row.created_by,
    title: row.title,
    description: row.description,
    date: row.date,
    time: row.time,
    repeatRule: safeJsonParse(row.repeat_rule, null),
    allDay: Boolean(row.all_day),
    memberId: row.member_id,
    location: row.location,
    createdAt: row.created_at
  };
}

function withinRange(day, range) {
  return day >= range.start && day <= range.end;
}

function cloneWithDate(event, dateValue) {
  return {
    ...event,
    date: dateValue.toISODate()
  };
}

function expandDaily(event, range, interval) {
  const occurrences = [];
  let cursor = DateTime.fromISO(event.date).startOf('day');
  if (!cursor.isValid) return occurrences;
  const maxDate = range.end;
  let safety = 0;

  if (range.start > cursor) {
    const diffDays = Math.floor(range.start.diff(cursor, 'days').days);
    const skips = Math.floor(diffDays / interval);
    cursor = cursor.plus({ days: skips * interval });
    while (cursor < range.start) {
      cursor = cursor.plus({ days: interval });
    }
  }

  while (cursor <= maxDate && safety < MAX_OCCURRENCES) {
    if (withinRange(cursor, range)) {
      occurrences.push(cloneWithDate(event, cursor));
    }
    cursor = cursor.plus({ days: interval });
    safety += 1;
  }

  return occurrences;
}

function expandWeekly(event, range, interval, rule) {
  const occurrences = [];
  const base = DateTime.fromISO(event.date).startOf('day');
  if (!base.isValid) return occurrences;
  const weekdays = Array.isArray(rule.byWeekday) && rule.byWeekday.length
    ? rule.byWeekday
    : [((base.weekday) % 7)];
  let cursor = range.start > base ? range.start.startOf('day') : base;

  const maxDate = range.end;
  let safety = 0;

  while (cursor <= maxDate && safety < MAX_OCCURRENCES) {
    const weeksFromBase = Math.floor(cursor.diff(base, 'days').days / 7);
    const weekday = cursor.weekday % 7;

    if (cursor >= base && weeksFromBase % interval === 0 && weekdays.includes(weekday) && withinRange(cursor, range)) {
      occurrences.push(cloneWithDate(event, cursor));
    }

    cursor = cursor.plus({ days: 1 });
    safety += 1;
  }

  return occurrences;
}

function expandMonthly(event, range, interval) {
  const occurrences = [];
  let cursor = DateTime.fromISO(event.date).startOf('day');
  if (!cursor.isValid) return occurrences;
  const maxDate = range.end;
  let safety = 0;

  if (range.start > cursor) {
    const diffMonths = Math.floor(range.start.diff(cursor, 'months').months);
    const skips = Math.floor(diffMonths / interval);
    cursor = cursor.plus({ months: skips * interval });
    while (cursor < range.start) {
      cursor = cursor.plus({ months: interval });
    }
  }

  while (cursor <= maxDate && safety < MAX_OCCURRENCES) {
    if (withinRange(cursor, range)) {
      occurrences.push(cloneWithDate(event, cursor));
    }
    cursor = cursor.plus({ months: interval });
    safety += 1;
  }

  return occurrences;
}

export function expandEvent(event, range) {
  const rule = event.repeatRule;
  if (!rule || rule.type === 'none') {
    const date = DateTime.fromISO(event.date).startOf('day');
    return withinRange(date, range) ? [event] : [];
  }

  const interval = Math.max(1, Number(rule.interval) || 1);
  const until = rule.until ? DateTime.fromISO(rule.until).endOf('day') : null;
  if (until && until < range.start) return [];
  const limitedRange = until ? { start: range.start, end: DateTime.min(range.end, until) } : range;

  switch (rule.type) {
    case 'daily':
      return expandDaily(event, limitedRange, interval);
    case 'weekly':
      return expandWeekly(event, limitedRange, interval, rule);
    case 'monthly':
      return expandMonthly(event, limitedRange, interval);
    default:
      return expandDaily(event, limitedRange, interval);
  }
}

export function expandEvents(rows, from, to) {
  const range = normalizeRange(from, to);
  return rows.flatMap((row) => expandEvent(mapEventRow(row), range));
}

export function summarizeEvents(events) {
  if (!events.length) return 'No events scheduled.';
  const sorted = [...events].sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`));
  const top = sorted.slice(0, 3).map((event) => {
    const timeLabel = event.allDay || !event.time ? 'All day' : event.time;
    return `${timeLabel} — ${event.title}`;
  });
  const remaining = events.length - top.length;
  const extra = remaining > 0 ? ` +${remaining} more` : '';
  return `${top.join('; ')}${extra}`;
}
