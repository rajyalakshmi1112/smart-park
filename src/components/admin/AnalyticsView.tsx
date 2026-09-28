import React from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle, MapPin, Sparkles } from 'lucide-react';
import { Booking, ParkingFacility, ParkingSlot } from '../../types';

interface AnalyticsViewProps {
  bookings: Booking[];
  facilities: ParkingFacility[];
  slots: ParkingSlot[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ bookings, facilities, slots }) => {
  // Prototype simulated analytics metrics
  const totalBookings = bookings.length;
  const noShowCount = bookings.filter((b) => b.status === 'NO_SHOW').length;
  const noShowRate = totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 8;

  // Hourly curve simulated occupancy
  const hourlyOccupancy = [
    { hour: '06 AM', occupancy: 18 },
    { hour: '08 AM', occupancy: 42 },
    { hour: '10 AM', occupancy: 68 },
    { hour: '12 PM', occupancy: 74 },
    { hour: '02 PM', occupancy: 58 },
    { hour: '04 PM', occupancy: 65 },
    { hour: '06 PM', occupancy: 88 },
    { hour: '08 PM', occupancy: 92 },
    { hour: '10 PM', occupancy: 54 }
  ];

  // Daily bookings past 7 days (simulated)
  const dailyBookings = [
    { day: 'Mon', count: 112 },
    { day: 'Tue', count: 124 },
    { day: 'Wed', count: 135 },
    { day: 'Thu', count: 129 },
    { day: 'Fri', count: 158 },
    { day: 'Sat', count: 194 },
    { day: 'Sun (Today)', count: 146 }
  ];

  const maxBookings = Math.max(...dailyBookings.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Top Banner Notice (Section 19) */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Smart Mobility Telemetry & Prototype Analytics
          </span>
        </div>
        <span className="text-[11px] font-mono text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded">
          Prototype / simulated data
        </span>
      </div>

      {/* 4 Summary Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Peak Parking Hours</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono-numbers">6 PM – 9 PM</div>
          <div className="text-[11px] text-emerald-600 font-medium">Beach corridor sunset demand</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">No-Show Rate</div>
          <div className="text-xl font-extrabold text-amber-700 font-mono-numbers">{noShowRate}%</div>
          <div className="text-[11px] text-slate-500">Slots auto-released after 20 mins</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Average Parking Duration</div>
          <div className="text-xl font-extrabold text-blue-700 font-mono-numbers">2.4 Hours</div>
          <div className="text-[11px] text-slate-500">Based on barrier checkout logs</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-medium">Most-Used Parking Location</div>
          <div className="text-lg font-bold text-slate-900 truncate">RK Beach Parking</div>
          <div className="text-[11px] text-slate-500">41% of total city reservation volume</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Occupancy Over Time (Hourly Curve) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Occupancy Over Time (Today)</h3>
              <p className="text-xs text-slate-500">Average % bay utilization across Vizag facilities</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Peak: 92%
            </span>
          </div>

          <div className="pt-4 h-52 flex items-end justify-between gap-2">
            {hourlyOccupancy.map((item) => (
              <div key={item.hour} className="flex-1 flex flex-col items-center gap-1.5 group">
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-900 transition-colors">
                  {item.occupancy}%
                </span>
                <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                  <div
                    style={{ height: `${item.occupancy}%` }}
                    className={`w-full rounded-t-md transition-all duration-500 ${
                      item.occupancy > 80
                        ? 'bg-rose-500'
                        : item.occupancy > 60
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-500 truncate">{item.hour}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Free / Light (&lt;60%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Moderate (60-80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Peak Demand (&gt;80%)
            </span>
          </div>
        </div>

        {/* Chart 2: Bookings Per Day */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Reservations Per Day (Past Week)</h3>
              <p className="text-xs text-slate-500">Confirmed prototype booking volume</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              Avg: 143 / day
            </span>
          </div>

          <div className="pt-4 h-52 flex items-end justify-between gap-3">
            {dailyBookings.map((d) => {
              const heightPercent = (d.count / maxBookings) * 100;
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] font-mono text-slate-500 font-bold font-mono-numbers">
                    {d.count}
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-slate-800 group-hover:bg-emerald-600 rounded-t-md transition-all duration-300"
                    />
                  </div>
                  <span className="text-[10px] text-slate-600 font-medium truncate">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            Weekend surge driven by Beach Road recreational and tourist visits
          </div>
        </div>
      </div>
    </div>
  );
};
