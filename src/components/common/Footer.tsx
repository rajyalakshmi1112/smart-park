import React from 'react';
import { Compass, ShieldCheck, Cpu } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-sm mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center text-slate-950 font-bold font-mono text-sm">
                P
              </div>
              <span className="text-white font-bold text-base tracking-tight">SmartPark Vizag</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              From reservation to barrier — one connected parking system. Designed as a technology prototype for Visakhapatnam, Andhra Pradesh, reducing manual intervention in parking reservation, ticket verification, entry management, and parking-slot allocation.
            </p>
            <div className="inline-block text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/50 rounded px-2.5 py-1">
              Prototype system with simulated infrastructure and demo parking locations.
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Customer Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-400 transition-colors">
                  Find Parking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-bookings')} className="hover:text-emerald-400 transition-colors">
                  My Bookings & QR Tickets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('entry-gate')} className="hover:text-emerald-400 transition-colors">
                  Smart Entry Gate Simulator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('exit-gate')} className="hover:text-emerald-400 transition-colors">
                  Smart Exit Gate Simulator
                </button>
              </li>
            </ul>
          </div>

          {/* Admin & Operations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Admin & Operations</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Admin Console & Slot Grid
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('search')} className="hover:text-emerald-400 transition-colors">
                  Live Parking Map
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('entry-gate')} className="hover:text-emerald-400 transition-colors">
                  Gate Barrier Audit
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider & attribution */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 SmartPark Vizag Prototype · Visakhapatnam Smart Mobility Initiative</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Prototype Version 1.0</span>
            <span aria-hidden="true">·</span>
            <span>Simulated Automated Barrier System</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
