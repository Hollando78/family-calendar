import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { api } from '../lib/api.js';
import { enablePush as enablePushNotifications } from '../lib/push.js';

const TOKEN_KEY = 'family-calendar-token';

const AppContext = createContext(null);

function getDefaultRange() {
  const today = DateTime.now().toISODate();
  const end = DateTime.now().plus({ weeks: 2 }).toISODate();
  return { from: today, to: end };
}

export function AppProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [range, setRange] = useState(getDefaultRange);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setFamily(null);
      setMembers([]);
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([api.getProfile(token), api.getEvents(token, range)])
      .then(([profile, eventsResponse]) => {
        setUser(profile.user);
        setFamily(profile.family);
        setMembers(profile.members);
        setEvents(eventsResponse.events);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, range]);

  const joinFamily = async (payload) => {
    const response = await api.joinFamily(payload);
    localStorage.setItem(TOKEN_KEY, response.token);
    setToken(response.token);
    setFamily(response.family);
    setUser(response.user);
    return response;
  };

  const refreshEvents = async (overrideRange = range) => {
    if (!token) return;
    const result = await api.getEvents(token, overrideRange);
    setEvents(result.events);
    if (overrideRange.from !== range.from || overrideRange.to !== range.to) {
      setRange(overrideRange);
    }
  };

  const createEvent = async (payload) => {
    if (!token) return null;
    await api.createEvent(token, payload);
    await refreshEvents(range);
  };

  const updateEvent = async (id, payload) => {
    if (!token) return null;
    await api.updateEvent(token, id, payload);
    await refreshEvents(range);
  };

  const deleteEvent = async (id) => {
    if (!token) return null;
    await api.deleteEvent(token, id);
    await refreshEvents(range);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  const requestPush = async () => {
    if (!token) throw new Error('Missing token');
    return enablePushNotifications(token);
  };

  const value = useMemo(() => ({
    token,
    user,
    family,
    members,
    events,
    loading,
    error,
    joinFamily,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    logout,
    requestPush
  }), [token, user, family, members, events, loading, error]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return ctx;
};
