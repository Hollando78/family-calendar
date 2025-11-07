import { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';

export default function JoinFamily() {
  const { joinFamily } = useAppContext();
  const [form, setForm] = useState({
    memberName: '',
    joinCode: '',
    familyName: '',
    email: '',
    color: '#2B6CB0'
  });
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');
    try {
      await joinFamily(form);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 shadow-lg">
        <h1 className="text-2xl font-semibold text-slate-900 text-center">Family Calendar</h1>
        <p className="text-sm text-slate-500 text-center">
          Join an existing family with a code or create a new shared calendar.
        </p>

        <label className="block text-sm font-medium text-slate-600">
          Your name
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1"
            value={form.memberName}
            onChange={updateField('memberName')}
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-600">
          Email (optional)
          <input
            type="email"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1"
            value={form.email}
            onChange={updateField('email')}
          />
        </label>

        <label className="block text-sm font-medium text-slate-600">
          Join code
          <input
            className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1 uppercase"
            value={form.joinCode}
            onChange={updateField('joinCode')}
            placeholder="Leave blank to create new family"
          />
        </label>

        {!form.joinCode && (
          <label className="block text-sm font-medium text-slate-600">
            Family name
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1"
              value={form.familyName}
              onChange={updateField('familyName')}
              placeholder="The Smiths"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-600">
          Colour tag
          <input
            type="color"
            className="w-full border border-slate-200 rounded-xl px-3 py-2 mt-1 h-10"
            value={form.color}
            onChange={updateField('color')}
          />
        </label>

        {status && <p className="text-sm text-red-600">{status}</p>}

        <button
          type="submit"
          className="w-full bg-primary text-white rounded-xl py-3 font-semibold"
          disabled={submitting}
        >
          {submitting ? 'Working...' : form.joinCode ? 'Join family' : 'Create family'}
        </button>
      </form>
    </div>
  );
}
