import React from 'react';
import { ArrowRight, Calendar, QrCode, Grid3X3, Sparkles, TrendingUp, CheckCircle2, Shield, Clock } from 'lucide-react';

interface LandingHeroProps {
  onNavigate: (view: string) => void;
  onOpenChatbot?: () => void;
  onOpenDemo?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate, onOpenChatbot, onOpenDemo }) => {
  return (
    <div className="space-y-16">
      {/* Hero Block */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
                <span>Visakhapatnam Smart Mobility Prototype</span>
                <span aria-hidden="true">·</span>
                <span>Automated Barrier System</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] text-balance">
                Smart Parking for Visakhapatnam
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                Reserve your parking space before you arrive. Scan your digital ticket at the gate and park without the usual manual process.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('search')}
                  className="px-6 py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Find Parking
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('my-bookings')}
                  className="px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-sm"
                >
                  My Bookings
                </button>

                {onOpenChatbot && (
                  <button
                    onClick={onOpenChatbot}
                    className="px-5 py-3.5 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all shadow-xs flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Ask AI Concierge</span>
                  </button>
                )}
              </div>

              {/* Tagline proof points */}
              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-900 text-sm font-mono-numbers">01</div>
                  <div className="text-[11px] text-slate-500">Pre-Book Online</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm font-mono-numbers">02</div>
                  <div className="text-[11px] text-slate-500">QR Gate Verification</div>
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm font-mono-numbers">03</div>
                  <div className="text-[11px] text-slate-500">Automated Slot Allocation</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
                <img
                  src="/src/assets/images/hero_vizag_smartpark_1790580611665.jpg"
                  alt="SmartPark Vizag coastal automated parking facility along RK Beach road"
                  referrerPolicy="no-referrer"
                  className="w-full h-[360px] sm:h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Fallback container if image fails */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950 p-6 flex flex-col justify-end -z-10">
                  <div className="text-white font-bold text-lg">SmartPark Vizag Prototype Facility</div>
                  <div className="text-slate-300 text-xs">Automated barrier & bay-sensor demonstration</div>
                </div>

                {/* Live simulation overlay badge */}
                <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5 text-white text-xs flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-[11px]">CMR Central Maddilapalem Gate Active</span>
                </div>

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-5 text-white">
                  <div className="text-xs text-emerald-400 font-mono font-medium">SIMULATED FACILITY</div>
                  <div className="text-base font-semibold">CMR Central Maddilapalem Facility</div>
                  <p className="text-xs text-slate-300 mt-1">
                    Automated barrier gate with optical QR verification and slot guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            How SmartPark Vizag Works
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Reducing manual intervention in parking reservation, ticket verification, entry management and slot allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Reserve Before Arrival</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose your parking location, time and duration before travelling. Secure your designated slot in advance.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">QR-Based Entry</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Scan your digital ticket at the entrance for automated booking validation. The simulated boom barrier opens automatically upon verification.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Grid3X3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Smart Slot Management</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Parking slots are automatically tracked and assigned (A-01 to A-50). Prevents double booking and monitors real-time bay occupancy.
            </p>
          </div>
        </div>
      </section>

      {/* Parking Intelligence Section (Section 20) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TODAY'S PARKING INSIGHT</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Simulated Peak Demand Forecast
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prototype intelligence based on simulated coastal mobility and tourist flow data in Visakhapatnam.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="text-xs text-slate-400">Peak Demand</div>
                <div className="text-lg font-bold text-emerald-400 font-mono-numbers">6 PM – 9 PM</div>
                <div className="text-[10px] text-slate-500">Beach corridor rush</div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Expected Occupancy</div>
                <div className="text-lg font-bold text-amber-400 font-mono-numbers">82%</div>
                <div className="text-[10px] text-slate-500">High bay utilization</div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <div className="text-xs text-slate-400">Recommendation</div>
                <div className="text-xs font-semibold text-white mt-1">Reserve before arriving during peak hours.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
