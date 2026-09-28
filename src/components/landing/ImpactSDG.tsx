import React from 'react';
import { Globe, Leaf, Zap, BarChart2, CheckCircle2 } from 'lucide-react';

export const ImpactSDG: React.FC = () => {
  return (
    <section id="impact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full mb-3">
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sustainable Development Goals Alignment</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Urban Mobility & Sustainability Impact
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            SmartPark Vizag aligns with the United Nations Sustainable Development Goals by engineering digital infrastructure that minimizes idling, reduces circling traffic, and streamlines city transit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* SDG 9 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                SDG 9
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Industry, Innovation & Infrastructure
                </h3>
                <p className="text-xs text-amber-800 font-medium">Digital Automation for Municipal Parking</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Prototype Capability:</strong> Implements automated QR verification, real-time slot state machines (Available/Reserved/Occupied), and atomic booking allocation.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Future Impact:</strong> Modernizes civic transit hubs with low-cost edge IoT controllers (ESP32) and automated barrier gates without requiring expensive proprietary hardware.
                </span>
              </div>
            </div>
          </div>

          {/* SDG 11 */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                SDG 11
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sustainable Cities & Communities
                </h3>
                <p className="text-xs text-emerald-800 font-medium">Reduction of Urban Circling Congestion</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Prototype Capability:</strong> Allows motorists to verify facility capacity and reserve bays before entering busy corridors like RK Beach and Jagadamba Junction.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Future Impact:</strong> Reducing cruising for parking cuts vehicular emissions, diesel/petrol consumption, and bottleneck delays across Visakhapatnam's coastal artery.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer banner */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p>
            <strong>Note on Prototype Scope:</strong> This demonstration presents simulated capacity and automated barrier logic. It does not claim to have already produced city-wide environmental or traffic reductions.
          </p>
          <span className="shrink-0 text-[11px] text-slate-500 font-mono">Academic / Innovation Prototype</span>
        </div>
      </div>
    </section>
  );
};
