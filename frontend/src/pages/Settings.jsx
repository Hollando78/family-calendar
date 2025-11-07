import { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export default function Settings() {
  const { user, family, logout, requestPush } = useAppContext();
  const [message, setMessage] = useState('');

  const handleEnablePush = async () => {
    try {
      await requestPush();
      setMessage('Push notifications enabled!');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Manage your profile and notifications.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 space-y-3 border border-slate-100">
        <h3 className="text-sm uppercase text-slate-500">Profile</h3>
        <p className="text-lg font-semibold">{user?.name}</p>
        {user?.email && <p className="text-sm text-slate-500">{user.email}</p>}
        {user?.color && (
          <span className="inline-flex items-center gap-2 text-sm text-slate-600">
            Colour tag
            <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: user.color }} />
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
        <h3 className="text-sm uppercase text-slate-500">Family code</h3>
        <p className="text-2xl font-mono tracking-widest">{family?.joinCode}</p>
        <p className="text-xs text-slate-500">Share this code so relatives can join.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
        <h3 className="text-sm uppercase text-slate-500">Notifications</h3>
        <p className="text-sm text-slate-500">Enable twice-daily push reminders.</p>
        <button
          type="button"
          onClick={handleEnablePush}
          className="bg-primary text-white rounded-xl px-4 py-2 font-semibold"
        >
          Enable push
        </button>
        {message && <p className="text-xs text-slate-500">{message}</p>}
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full border border-red-100 text-red-600 rounded-xl py-2 font-semibold"
      >
        Sign out
      </button>
    </section>
  );
}
