import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import PublicCalendar from './pages/PublicCalendar';
import PublicPriority from './pages/PublicPriority';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AppShell from './layouts/AppShell';
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/calendar/CalendarPage';
import PicPage from './pages/pic/PicPage';
import { useEventStore } from './store/eventStore';

function App() {
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const fetchPics = useEventStore((state) => state.fetchPics);

  useEffect(() => {
    fetchEvents();
    fetchPics();
  }, [fetchEvents, fetchPics]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicCalendar />} />
        <Route path="/prioritas" element={<PublicPriority />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Protected Routes (Management Area) */}
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kalender" element={<CalendarPage />} />
        <Route path="/prioritas/manage" element={<PublicPriority />} />
        <Route path="/pic" element={<PicPage />} />
        <Route path="/notifikasi" element={<div className="p-6 bg-surface rounded-lg shadow-sm">Notifikasi Management Area</div>} />
        <Route path="/pengaturan" element={<div className="p-6 bg-surface rounded-lg shadow-sm">Pengaturan Area</div>} />
      </Route>
    </Routes>
  );
}

export default App;



