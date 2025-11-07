import { useMemo } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { DateTime } from 'luxon';
import { useAppContext } from '../context/AppContext.jsx';

export default function EventsList({ events = [], onEditEvent }) {
  const { members } = useAppContext();
  const memberMap = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member])), [members]);

  const grouped = useMemo(() => {
    const map = {};
    events
      .slice()
      .sort((a, b) => `${a.date} ${a.time || ''}`.localeCompare(`${b.date} ${b.time || ''}`))
      .forEach((event) => {
        if (!map[event.date]) {
          map[event.date] = [];
        }
        map[event.date].push(event);
      });
    return map;
  }, [events]);

  const dates = Object.keys(grouped).sort();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">All family events</p>
          <h2 className="text-2xl font-semibold text-slate-900">Timeline</h2>
        </div>
      </div>

      {dates.length === 0 && <p className="text-sm text-slate-500">No events yet.</p>}

      <div className="space-y-4">
        {dates.map((date) => {
          const readable = DateTime.fromISO(date).toFormat('cccc, LLL dd');
          return (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <CalendarDays className="w-4 h-4" />
                <span>{readable}</span>
              </div>
              <div className="space-y-2">
                {grouped[date].map((event) => (
                  <article key={event.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{event.title}</p>
                        {event.location && <p className="text-xs text-slate-500">{event.location}</p>}
                      </div>
                      <button type="button" className="text-xs text-primary font-semibold" onClick={() => onEditEvent?.(event)}>
                        Edit
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{event.allDay ? 'All day' : event.time || '—'}</span>
                      {event.repeatRule && <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px]">Repeats</span>}
                    </div>
                    {event.description && <p className="text-sm text-slate-600">{event.description}</p>}
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
