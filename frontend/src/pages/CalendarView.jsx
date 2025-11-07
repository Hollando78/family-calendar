import { DateTime } from 'luxon';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeek(start = DateTime.now()) {
  return Array.from({ length: 7 }, (_, index) => start.plus({ days: index }));
}

function buildMonthDays(anchor) {
  const startOfMonth = anchor.startOf('month');
  const firstDayOfGrid = startOfMonth.startOf('week');
  return Array.from({ length: 42 }, (_, index) => firstDayOfGrid.plus({ days: index }));
}

function useEventMap(events = []) {
  return useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [events]);
}

export default function CalendarView({ events = [], onAddEvent, onEditEvent }) {
  const [selectedDate, setSelectedDate] = useState(DateTime.now().toISODate());
  const [viewMode, setViewMode] = useState('week');
  const anchorDate = DateTime.fromISO(selectedDate);

  const { members } = useAppContext();
  const week = buildWeek(anchorDate.startOf('week'));
  const monthDays = buildMonthDays(anchorDate);
  const eventMap = useEventMap(events);
  const dayEvents = eventMap[selectedDate] || [];
  const memberMap = useMemo(() => Object.fromEntries(members.map((member) => [member.id, member])), [members]);
  const getEventColor = (event) => event.color || memberMap[event.memberId]?.color || '#94a3b8';

  const changeMonth = (direction) => {
    const newDate = anchorDate.plus({ months: direction }).startOf('month');
    setSelectedDate(newDate.toISODate());
  };

  const renderDayEvents = () => (
    <div className="space-y-2">
      {dayEvents.length === 0 && <p className="text-sm text-slate-500">Nothing planned for this day.</p>}
      {dayEvents.map((event, index) => (
        <article
          key={event.id || `${event.title}-${index}`}
          className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100"
          style={{ borderLeft: `4px solid ${getEventColor(event)}` }}
        >
          <div className="flex items-center justify-between mb-1 gap-4">
            <p className="font-semibold text-slate-900">{event.title}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>{event.allDay ? 'All day' : event.time || '--'}</span>
              <button type="button" className="text-primary" onClick={() => onEditEvent?.(event)}>
                Edit
              </button>
            </div>
          </div>
          {event.description && <p className="text-sm text-slate-500">{event.description}</p>}
          {event.memberId && (
            <span
              className="inline-flex px-2 py-1 rounded-full text-xs font-medium border"
              style={{ borderColor: getEventColor(event), color: getEventColor(event) }}
            >
              {memberMap[event.memberId]?.name || 'Member'}
            </span>
          )}
        </article>
      ))}
    </div>
  );

  const renderWeekStrip = () => (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {week.map((day) => {
        const dateKey = day.toISODate();
        const isActive = dateKey === selectedDate;
        const eventsForDay = eventMap[dateKey] || [];
        const hasEvents = Boolean(eventsForDay.length);
        const dotColor = eventsForDay[0] ? getEventColor(eventsForDay[0]) : '#F97316';
        return (
          <button
            type="button"
            key={dateKey}
            onClick={() => setSelectedDate(dateKey)}
            className={`flex flex-col items-center px-3 py-2 rounded-2xl border transition ${
              isActive ? 'bg-primary text-white border-primary' : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <span className="text-xs uppercase">{day.toFormat('ccc')}</span>
            <span className="text-lg font-semibold">{day.toFormat('dd')}</span>
            {hasEvents && <span className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: dotColor }} />}
          </button>
        );
      })}
    </div>
  );

  const renderMonthGrid = () => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-semibold text-slate-700">{anchorDate.toFormat('LLLL yyyy')}</div>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs uppercase text-slate-400">
        {weekdayLabels.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day) => {
          const dateKey = day.toISODate();
          const isCurrentMonth = day.month === anchorDate.month;
          const isSelected = dateKey === selectedDate;
          const dailyEvents = eventMap[dateKey] || [];
          return (
            <button
              type="button"
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className={`min-h-[72px] rounded-xl border px-2 py-2 text-left transition ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : isCurrentMonth
                    ? 'border-slate-200 bg-white text-slate-700'
                    : 'border-transparent bg-slate-100 text-slate-300'
              }`}
            >
              <span className="text-sm font-semibold">{day.toFormat('d')}</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {dailyEvents.slice(0, 3).map((event) => (
                  <span
                    key={event.id}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getEventColor(event) }}
                  />
                ))}
                {dailyEvents.length > 3 && (
                  <span className="text-[10px] text-slate-500">+{dailyEvents.length - 3}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-slate-900">Calendar</h2>
        <button type="button" onClick={() => onAddEvent(selectedDate)} className="text-primary text-sm font-semibold">
          Add
        </button>
      </div>

      <div className="flex gap-2 rounded-2xl bg-white p-1 border border-slate-200 w-fit">
        {['week', 'month'].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1 rounded-xl text-sm font-semibold ${
              viewMode === mode ? 'bg-primary text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            {mode === 'week' ? 'Week' : 'Month'}
          </button>
        ))}
      </div>

      {viewMode === 'week' ? renderWeekStrip() : renderMonthGrid()}

      <div className="space-y-2">{renderDayEvents()}</div>
    </section>
  );
}
