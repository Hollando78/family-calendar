import { NavLink } from 'react-router-dom';
import { Plus, Home, CalendarClock, List, Settings as SettingsIcon } from 'lucide-react';
import { useAppContext } from '../context/AppContext.jsx';

const navItems = [
  { to: '/', label: 'Today', icon: Home },
  { to: '/calendar', label: 'Calendar', icon: CalendarClock },
  { to: '/events', label: 'Events', icon: List },
  { to: '/settings', label: 'Settings', icon: SettingsIcon }
];

export default function Layout({ children, onAddEvent }) {
  const { family } = useAppContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-20">
        <p className="text-xs uppercase text-slate-500">Family</p>
        <h1 className="text-xl font-semibold text-slate-900">{family?.name || 'Family Calendar'}</h1>
      </header>

      <main className="flex-1 px-4 py-4">{children}</main>

      <button
        type="button"
        onClick={() => onAddEvent()}
        className="fixed bottom-24 right-4 bg-primary text-white px-5 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Quick Add
      </button>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 text-center py-3 text-xs font-semibold tracking-wide ${
                  isActive ? 'text-primary' : 'text-slate-500'
                }`
              }
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className="w-5 h-5" />
                {item.label}
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
