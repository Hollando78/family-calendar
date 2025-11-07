import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { DateTime } from 'luxon';
import { useAppContext } from './context/AppContext.jsx';
import Layout from './components/Layout.jsx';
import TodayView from './pages/TodayView.jsx';
import CalendarView from './pages/CalendarView.jsx';
import Settings from './pages/Settings.jsx';
import JoinFamily from './pages/JoinFamily.jsx';
import AddEventSheet from './components/AddEventSheet.jsx';

function AuthedApp() {
  const { events } = useAppContext();
  const [sheetState, setSheetState] = useState({
    open: false,
    initialDate: DateTime.now().toISODate(),
    event: null
  });

  const openAddEvent = (date) => {
    setSheetState({
      open: true,
      initialDate: date || DateTime.now().toISODate(),
      event: null
    });
  };

  const openEditEvent = (event) => {
    setSheetState({
      open: true,
      initialDate: event.date,
      event
    });
  };

  const closeSheet = () => setSheetState((prev) => ({ ...prev, open: false, event: null }));

  return (
    <>
      <Layout onAddEvent={openAddEvent}>
        <Routes>
          <Route path="/" element={<TodayView events={events} onAddEvent={openAddEvent} onEditEvent={openEditEvent} />} />
          <Route
            path="/calendar"
            element={<CalendarView events={events} onAddEvent={openAddEvent} onEditEvent={openEditEvent} />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <AddEventSheet
        open={sheetState.open}
        onClose={closeSheet}
        initialDate={sheetState.initialDate}
        event={sheetState.event}
      />
    </>
  );
}

export default function App() {
  const { token } = useAppContext();

  return (
    <BrowserRouter>
      {token ? (
        <AuthedApp />
      ) : (
        <Routes>
          <Route path="*" element={<JoinFamily />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
