import './bootstrap';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEventStore } from './store/eventStore';

// Page & Feature Components
import Dashboard from './pages/Dashboard';
import CalendarPage from './pages/calendar/CalendarPage';
import PublicCalendar from './pages/PublicCalendar';
import PublicPriority from './pages/PublicPriority';
import PicPage from './pages/pic/PicPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EventDetailModal from './components/event/EventDetailModal';
import EventFormModal from './components/event/EventFormModal';

// Component Registry for Blade Views
const componentRegistry = {
  Dashboard,
  CalendarPage,
  PublicCalendar,
  PublicPriority,
  PicPage,
  Login,
  Register,
  ForgotPassword,
  EventDetailModal,
  EventFormModal,
};

// Synchronize client-side React Router navigation with Laravel Blade page transitions
function NavigationSync() {
  const location = useLocation();
  const initialPathRef = React.useRef(window.location.pathname);

  useEffect(() => {
    if (location.pathname !== initialPathRef.current) {
      window.location.href = location.pathname + location.search + location.hash;
    }
  }, [location]);

  return null;
}

// Wrapper Component that ensures event & pic data are initialized in Zustand store
function ComponentWrapper({ Component, props, componentName }) {
  const fetchEvents = useEventStore((state) => state.fetchEvents);
  const fetchPics = useEventStore((state) => state.fetchPics);

  useEffect(() => {
    const name = componentName || Component.displayName || Component.name;
    const isAuthComponent = ['Login', 'Register', 'ForgotPassword'].includes(name);
    if (!isAuthComponent) {
      fetchEvents();
      fetchPics();
    }
  }, [fetchEvents, fetchPics, Component, componentName]);

  return (
    <BrowserRouter>
      <NavigationSync />
      <Component {...props} />
    </BrowserRouter>
  );
}

// Function to scan and mount all React components in the Blade page
function mountReactComponents() {
  // 1. Mount via data-react-component attribute
  const elements = document.querySelectorAll('[data-react-component]');
  elements.forEach((el) => {
    const componentName = el.dataset.reactComponent;
    const Component = componentRegistry[componentName];

    if (Component) {
      let props = {};
      if (el.dataset.props) {
        try {
          props = JSON.parse(el.dataset.props);
        } catch (e) {
          console.error(`[React Mount] Failed to parse props for ${componentName}:`, e);
        }
      }

      createRoot(el).render(<ComponentWrapper Component={Component} props={props} componentName={componentName} />);
    } else {
      console.warn(`[React Mount] Component "${componentName}" was not found in registry.`);
    }
  });

  // 2. Direct ID-based mounts for convenience
  const idMap = {
    'react-dashboard': Dashboard,
    'react-calendar': CalendarPage,
    'react-public-calendar': PublicCalendar,
    'react-public-priority': PublicPriority,
    'react-pic': PicPage,
    'react-login': Login,
    'react-register': Register,
    'react-forgot-password': ForgotPassword,
  };

  Object.entries(idMap).forEach(([id, Component]) => {
    const el = document.getElementById(id);
    if (el && !el.dataset.reactComponent) {
      let props = {};
      if (el.dataset.props) {
        try {
          props = JSON.parse(el.dataset.props);
        } catch (e) {
          console.error(`[React Mount] Failed to parse props for #${id}:`, e);
        }
      }
      createRoot(el).render(<ComponentWrapper Component={Component} props={props} />);
    }
  });
}

// Auto mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountReactComponents);
} else {
  mountReactComponents();
}
