import { DateTime } from 'luxon';
import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export default function TodayView({ events = [], onAddEvent, onEditEvent }) {
  const today = DateTime.now().toISODate();
  const { members, loading } = useAppContext();
  const memberMap = useMemo(() => Object.fromEntries(members.map((m) => [m.id, m])), [members]);

  const todaysEvents = useMemo(
    () => events.filter((event) => event.date === today),
    [events, today]
  );

  const allDay = todaysEvents.filter((event) => event.allDay);
  const timed = todaysEvents
    .filter((event) => !event.allDay)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{DateTime.now().toFormat('cccc, LLL dd')}</p>
          <h2 className="text-2xl font-semibold text-slate-900">Today</h2>
        </div>
        <button
          type="button"
          onClick={() => onAddEvent(today)}
          className="text-primary text-sm font-semibold"
        >
          Add
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading events...</p>}

      {!loading && todaysEvents.length === 0 && (
        <p className="text-sm text-slate-500">No events scheduled today.</p>
      )}

      {allDay.length > 0 && (
        <div>
          <p className="text-xs uppercase text-slate-500 mb-2">All day</p>
          <div className="space-y-2">
            {allDay.map((event) => (
              <article key={event.id} className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <button type="button" className="text-xs text-primary" onClick={() => onEditEvent?.(event)}>
                    Edit
                  </button>
                </div>
                {event.description && <p className="text-sm text-slate-500">{event.description}</p>}
              </article>
            ))}
          </div>
        </div>
      )}

      {timed.length > 0 && (
        <div>
          <p className="text-xs uppercase text-slate-500 mb-2">Schedule</p>
          <div className="space-y-3">
            {timed.map((event) => (
              <article key={event.id} className="bg-white rounded-2xl p-3 shadow-sm flex gap-3">
                <div className="text-sm font-semibold text-primary min-w-[60px]">{event.time || '--'}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{event.title}</p>
                    <button type="button" className="text-xs text-primary" onClick={() => onEditEvent?.(event)}>
                      Edit
                    </button>
                  </div>
                  {event.location && <p className="text-xs text-slate-500">{event.location}</p>}
                  {event.memberId && (
                    <p className="text-xs text-slate-500 mt-1">
                      {memberMap[event.memberId]?.name || 'Family'}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
