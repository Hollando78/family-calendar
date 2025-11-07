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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [prefillDate, setPrefillDate] = useState(DateTime.now().toISODate());

  const openAddEvent = (date) => {
    setPrefillDate(date || DateTime.now().toISODate());
    setSheetOpen(true);
  };

  return (
    <>
      <Layout onAddEvent={openAddEvent}>
        <Routes>
          <Route path="/" element={<TodayView events={events} onAddEvent={openAddEvent} />} />
          <Route path="/calendar" element={<CalendarView events={events} onAddEvent={openAddEvent} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <AddEventSheet open={sheetOpen} onClose={() => setSheetOpen(false)} initialDate={prefillDate} />
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
