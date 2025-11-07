import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext.jsx';

const navItems = [
  { to: '/', label: 'Today' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/settings', label: 'Settings' }
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
        className="fixed bottom-24 right-4 bg-primary text-white px-5 py-3 rounded-full shadow-lg font-semibold"
      >
        + Add Event
      </button>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 flex">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 text-center py-3 text-sm font-medium ${isActive ? 'text-primary' : 'text-slate-500'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
