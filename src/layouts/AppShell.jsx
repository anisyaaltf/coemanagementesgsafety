import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Calendar, AlertTriangle, Users, Bell, Settings, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function AppShell() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userString = localStorage.getItem('user');
  let userName = 'Admin Safety';
  if (userString) {
    try {
      const userObj = JSON.parse(userString);
      if (userObj && userObj.name) {
        userName = userObj.name;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const userInitial = userName.charAt(0).toUpperCase() || 'A';

  const handleLogout = () => {
    localStorage.removeItem('user');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Kalender Event', path: '/kalender', icon: <Calendar size={19} /> },
    { name: 'Prioritas Kegiatan', path: '/prioritas/manage', icon: <AlertTriangle size={19} /> },
    { name: 'PIC', path: '/pic', icon: <Users size={19} /> },
    { name: 'Notifikasi', path: '/notifikasi', icon: <Bell size={19} /> },
    { name: 'Pengaturan', path: '/pengaturan', icon: <Settings size={19} /> },
  ];

  return (
    <div className="flex h-screen bg-bg font-sans overflow-hidden relative">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 w-72 max-w-[85vw] lg:w-64 bg-gradient-to-b from-[#091523] via-[#0E1D2E] to-[#07111C] text-surface flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Sidebar Header & Logo */}
        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
          {/* Seamless Transparent Glass Container */}
          <div className="bg-white p-3 rounded-xl flex items-center justify-center border border-white/15 hover:bg-gray-100 transition-all duration-200">
            <img
              src="/img/logoNM.png"
              alt="Astra Otoparts Nusametal Division"
              className="h-10 sm:h-12 w-auto max-w-full object-contain"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[11px] font-extrabold tracking-widest text-slate-200 uppercase">
                ESG & SAFETY COE
              </span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
              title="Tutup Menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2.5 sm:px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-[#DE9A34] to-[#c78523] text-white font-bold shadow-md shadow-amber-500/20 translate-x-0.5'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
                      }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-300'}>{item.icon}</span>
                    <span className="tracking-wide text-xs sm:text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 sm:h-16 bg-surface/90 backdrop-blur-md border-b border-line/80 flex items-center justify-between px-3 sm:px-6 lg:px-8 shadow-xs z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-ink-soft hover:text-ink hover:bg-bg transition-colors cursor-pointer shrink-0"
              title="Buka Menu"
            >
              <Menu size={22} />
            </button>
            <div className="text-sm sm:text-lg font-bold text-ink truncate">
              {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2 bg-bg hover:bg-line/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-line transition-colors">
              <div className="w-6 h-6 rounded-full bg-accent text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {userInitial}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-ink max-w-[80px] xs:max-w-[120px] sm:max-w-[180px] truncate">
                {userName}
              </div>
            </div>

            <Link
              to="/"
              onClick={handleLogout}
              className="p-1.5 sm:p-2 text-ink-soft hover:text-pending hover:bg-pending/10 rounded-full transition-all cursor-pointer shrink-0"
              title="Logout"
            >
              <LogOut size={18} />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7 xl:p-8 animate-fadeIn">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
