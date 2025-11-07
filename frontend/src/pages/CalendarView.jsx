import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

function buildWeek(start = DateTime.now()) {
  return Array.from({ length: 7 }, (_, index) => start.plus({ days: index }));
}

export default function CalendarView({ events = [], onAddEvent }) {
  const [selectedDate, setSelectedDate] = useState(DateTime.now().toISODate());
  const { members } = useAppContext();
  const week = buildWeek();
  const dayEvents = useMemo(
    () => events.filter((event) => event.date === selectedDate),
    [events, selectedDate]
  );
  const memberMap = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member])), [members]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Calendar</h2>
        <button
          type="button"
          onClick={() => onAddEvent(selectedDate)}
          className="text-primary text-sm font-semibold"
        >
          Add
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {week.map((day) => {
          const dateKey = day.toISODate();
          const isActive = dateKey === selectedDate;
          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`flex flex-col items-center px-3 py-2 rounded-2xl border ${
                isActive ? 'bg-primary text-white border-primary' : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <span className="text-xs uppercase">{day.toFormat('ccc')}</span>
              <span className="text-lg font-semibold">{day.toFormat('dd')}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {dayEvents.length === 0 && <p className="text-sm text-slate-500">Nothing planned for this day.</p>}

        {dayEvents.map((event, index) => (
          <article key={event.id || `${event.title}-${index}`} className="bg-white rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-slate-900">{event.title}</p>
              <span className="text-xs text-slate-500">{event.allDay ? 'All day' : event.time || '--'}</span>
            </div>
            {event.description && <p className="text-sm text-slate-500">{event.description}</p>}
            {event.memberId && (
              <span
                className="inline-flex px-2 py-1 rounded-full text-xs font-medium border"
                style={{ borderColor: memberMap[event.memberId]?.color || '#94a3b8', color: memberMap[event.memberId]?.color || '#475569' }}
              >
                {memberMap[event.memberId]?.name || 'Member'}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
