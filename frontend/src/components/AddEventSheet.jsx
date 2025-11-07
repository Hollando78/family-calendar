import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useAppContext } from '../context/AppContext.jsx';

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function createDefaultForm(date) {
  const base = DateTime.fromISO(date || DateTime.now().toISODate());
  return {
    title: '',
    date: base.toISODate(),
    time: '09:00',
    allDay: false,
    repeat: 'none',
    interval: 1,
    weekdays: [(base.weekday % 7)],
    repeatUntil: '',
    memberId: '',
    location: '',
    description: ''
  };
}

function createFormFromEvent(event) {
  const baseDate = DateTime.fromISO(event.date || DateTime.now().toISODate());
  const repeatRule = event.repeatRule || null;
  return {
    title: event.title,
    date: event.date,
    time: event.time || '09:00',
    allDay: Boolean(event.allDay),
    repeat: repeatRule?.type || 'none',
    interval: repeatRule?.interval || 1,
    weekdays: repeatRule?.byWeekday?.length
      ? repeatRule.byWeekday
      : [((baseDate.weekday) % 7)],
    repeatUntil: repeatRule?.until || '',
    memberId: event.memberId ? String(event.memberId) : '',
    location: event.location || '',
    description: event.description || ''
  };
}

export default function AddEventSheet({ open, onClose, initialDate, event }) {
  const { members, createEvent, updateEvent, deleteEvent } = useAppContext();
  const [form, setForm] = useState(() => (event ? createFormFromEvent(event) : createDefaultForm(initialDate)));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const isEdit = Boolean(event);

  useEffect(() => {
    if (open) {
      setForm(event ? createFormFromEvent(event) : createDefaultForm(initialDate));
      setError(null);
    }
  }, [open, initialDate, event]);

  const repeatRule = useMemo(() => {
    if (form.repeat === 'none') return null;
    const payload = {
      type: form.repeat,
      interval: Number(form.interval) || 1
    };
    if (form.repeat === 'weekly') {
      payload.byWeekday = form.weekdays;
    }
    if (form.repeatUntil) {
      payload.until = form.repeatUntil;
    }
    return payload;
  }, [form.repeat, form.interval, form.weekdays, form.repeatUntil]);

  if (!open) return null;

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleWeekday = (index) => {
    setForm((prev) => {
      const exists = prev.weekdays.includes(index);
      const weekdays = exists ? prev.weekdays.filter((d) => d !== index) : [...prev.weekdays, index];
      return { ...prev, weekdays };
    });
  };

  const handleSubmit = async (submissionEvent) => {
    submissionEvent.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
        title: form.title,
        date: form.date,
        time: form.allDay ? null : form.time,
        allDay: form.allDay,
        memberId: form.memberId ? Number(form.memberId) : null,
        description: form.description || null,
        location: form.location || null,
        repeatRule
      };

    try {
      if (isEdit && event?.id) {
        await updateEvent(event.id, payload);
      } else {
        await createEvent(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;
    setSaving(true);
    setError(null);
    try {
      await deleteEvent(event.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-end md:items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-4 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit Event' : 'Add Event'}</h2>
          <button type="button" className="text-sm text-slate-500" onClick={onClose}>
            Close
          </button>
        </div>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Title</span>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.title}
            onChange={updateField('title')}
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-sm text-slate-600">Date</span>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
              value={form.date}
              onChange={updateField('date')}
              required
            />
          </label>
          {!form.allDay && (
            <label className="block space-y-1">
              <span className="text-sm text-slate-600">Time</span>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
                value={form.time}
                onChange={updateField('time')}
              />
            </label>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.allDay} onChange={updateField('allDay')} />
          All-day event
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Repeat</span>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.repeat}
            onChange={updateField('repeat')}
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>

        {form.repeat !== 'none' && (
          <div className="space-y-3 border border-slate-100 rounded-xl p-3 bg-slate-50">
            <label className="block text-sm text-slate-600">
              Interval
              <input
                type="number"
                min="1"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
                value={form.interval}
                onChange={updateField('interval')}
              />
            </label>

            {form.repeat === 'weekly' && (
              <div>
                <p className="text-sm text-slate-600 mb-2">Weekdays</p>
                <div className="flex gap-2">
                  {weekdayLabels.map((label, index) => (
                    <button
                      type="button"
                      key={label + index}
                      onClick={() => toggleWeekday(index)}
                      className={`w-9 h-9 rounded-full border ${
                        form.weekdays.includes(index)
                          ? 'bg-primary text-white border-primary'
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="block text-sm text-slate-600">
              Ends on
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 mt-1"
                value={form.repeatUntil}
                onChange={updateField('repeatUntil')}
              />
            </label>
          </div>
        )}

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Assign to</span>
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.memberId}
            onChange={updateField('memberId')}
          >
            <option value="">Everyone</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Location</span>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            value={form.location}
            onChange={updateField('location')}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Notes</span>
          <textarea
            className="w-full border border-slate-200 rounded-lg px-3 py-2"
            rows="3"
            value={form.description}
            onChange={updateField('description')}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-3">
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-xl py-3 font-semibold disabled:opacity-50"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEdit ? 'Update Event' : 'Save Event'}
          </button>

          {isEdit && (
            <button
              type="button"
              className="w-full border border-red-200 text-red-600 rounded-xl py-2 font-semibold disabled:opacity-50"
              onClick={handleDelete}
              disabled={saving}
            >
              Delete Event
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
