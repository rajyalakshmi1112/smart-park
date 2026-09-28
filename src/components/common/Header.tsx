import React, { useState } from 'react';
import { Menu, X, Sparkles, Car, QrCode, LogOut, LayoutDashboard, ChevronDown, Home } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, extraData?: any) => void;
  onOpenChatbot: () => void;
  activeBookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenChatbot,
  activeBookingCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2.5 text-left group shrink-0 focus-visible:outline-none"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
            <span className="font-bold text-base sm:text-lg leading-none font-mono">P</span>
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
            SmartPark Vizag
          </span>
        </button>

        {/* Zone 2: Navigation links (clean desktop navigation) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => handleNavClick('landing')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'landing' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavClick('search')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap ${
              currentView === 'search' || currentView === 'booking' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Find Parking
          </button>

          <button
            onClick={() => handleNavClick('my-bookings')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'my-bookings' || currentView === 'ticket' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            My Bookings
            {activeBookingCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full font-mono">
                {activeBookingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('entry-gate')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap ${
              currentView === 'entry-gate' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Smart Entry Gate
          </button>

          <button
            onClick={() => handleNavClick('exit-gate')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap ${
              currentView === 'exit-gate' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Smart Exit Gate
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`transition-colors hover:text-slate-900 whitespace-nowrap ${
              currentView === 'admin' ? 'text-emerald-700 font-semibold' : ''
            }`}
          >
            Admin Console
          </button>
        </nav>

        {/* Zone 3: Primary actions & Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenChatbot}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-xs"
            title="Ask SmartPark AI Concierge with Google Maps data"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">AI Concierge</span>
          </button>

          <button
            onClick={() => handleNavClick('search')}
            className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shadow-xs"
          >
            Reserve Slot
          </button>

          {/* Hamburger Menu Toggle (Mobile & Tablet) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
              currentView === 'landing' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              Home
            </span>
          </button>

          <button
            onClick={() => handleNavClick('search')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
              currentView === 'search' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Find Parking</span>
            <Car className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNavClick('my-bookings')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
              currentView === 'my-bookings' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="flex items-center gap-2">
              My Bookings & QR Tickets
              {activeBookingCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full font-mono">
                  {activeBookingCount}
                </span>
              )}
            </span>
            <QrCode className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNavClick('entry-gate')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
              currentView === 'entry-gate' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Smart Entry Gate</span>
            <span className="text-base">🚧</span>
          </button>

          <button
            onClick={() => handleNavClick('exit-gate')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
              currentView === 'exit-gate' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Smart Exit Gate</span>
            <LogOut className="w-4 h-4 text-blue-500" />
          </button>

          <button
            onClick={() => handleNavClick('admin')}
            className={`w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between ${
              currentView === 'admin' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Admin Console</span>
            <LayoutDashboard className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              onOpenChatbot();
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-between text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              SmartPark AI & Maps Assistant
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">Gemini</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNavClick('search')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center shadow-xs"
            >
              Reserve Parking Slot
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
