import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function PublicLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans">
      {/* Public Header */}
      <header className="bg-surface border-b border-line px-3.5 sm:px-6 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between gap-2.5">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity min-w-0">
            <img 
              src="/img/logoNM-transparent.png" 
              alt="Astra Otoparts Nusametal Division" 
              className="h-8 sm:h-10 md:h-11 w-auto max-w-[140px] sm:max-w-none object-contain shrink-0" 
            />
            <div className="border-l border-line pl-2.5 sm:pl-3 min-w-0">
              <h1 className="text-xs sm:text-base font-extrabold text-ink leading-tight m-0 truncate">ESG & SAFETY</h1>
              <p className="text-[9px] sm:text-[10px] text-ink-soft font-semibold tracking-wider uppercase m-0 truncate">COE Management</p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-ink-soft hover:text-ink hover:bg-bg rounded-lg focus:outline-none transition-colors cursor-pointer shrink-0"
            title="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Navigation Links & Login */}
        <div
          className={`${
            isMobileMenuOpen ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row md:items-center gap-3.5 md:gap-4 mt-3.5 md:mt-0 pt-3.5 md:pt-0 border-t md:border-t-0 border-line animate-fadeIn`}
        >
          <nav className="flex flex-col md:flex-row gap-2 md:gap-5">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-ink hover:text-accent font-semibold transition-colors text-sm py-2 px-3 md:px-0 md:py-0 rounded-lg hover:bg-bg md:hover:bg-transparent"
            >
              Kalender Event
            </Link>
            <Link
              to="/prioritas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-ink hover:text-accent font-semibold transition-colors text-sm py-2 px-3 md:px-0 md:py-0 rounded-lg hover:bg-bg md:hover:bg-transparent"
            >
              Prioritas Kegiatan
            </Link>
          </nav>
          <div className="pt-2 md:pt-0 flex flex-col sm:flex-row gap-2">
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-block w-full md:w-auto text-center border border-navy-deep text-navy-deep hover:bg-navy-deep hover:text-white px-4 py-2 rounded-lg transition-colors font-bold text-sm shadow-2xs"
            >
              Register
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-block w-full md:w-auto text-center bg-navy-deep text-surface px-4 py-2 rounded-lg hover:bg-ink transition-colors font-bold text-sm shadow-xs"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5 lg:p-7">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs sm:text-sm text-ink-soft border-t border-line mt-auto bg-surface">
        Public Read Only
      </footer>
    </div>
  );
}
