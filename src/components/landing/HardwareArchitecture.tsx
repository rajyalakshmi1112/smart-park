import React from 'react';
import { Cpu, ArrowDown, ArrowRight, Radio, Shield, Camera, Gauge, Zap } from 'lucide-react';

export const HardwareArchitecture: React.FC = () => {
  return (
    <section id="hardware" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 font-mono mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>EMBEDDED HARDWARE EXTENSION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Future Hardware Integration Architecture
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            The software verification layer developed in this prototype is architected to interface seamlessly with physical microcontrollers, boom barriers, and ultrasonic bay sensors.
          </p>
        </div>

        {/* Diagram: Flow 1 (QR Scanner to Barrier) & Flow 2 (Sensors to Occupancy) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Flow 1: Automated Gate Entry */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Subsystem A: Automated Gate Barrier
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Real-time I/O</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-200">1. QR Optical Scanner (2D Imager)</span>
                <span className="text-[11px] text-slate-400">Reads Ticket ID</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 text-emerald-500 animate-bounce" />
              </div>

              <div className="p-3 bg-emerald-950/50 border border-emerald-800/80 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-emerald-300">2. SmartPark Backend Validation API</span>
                <span className="text-[11px] text-emerald-400">Verifies Booking & Slot</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-200">3. ESP32 Wi-Fi / MQTT Controller</span>
                <span className="text-[11px] text-slate-400">GPIO Trigger Pulse</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-200">4. Motor Driver & Boom Barrier Arm</span>
                <span className="text-[11px] text-emerald-400 font-semibold">Simulated Gate OPEN</span>
              </div>
            </div>
          </div>

          {/* Flow 2: Bay Level Occupancy */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Subsystem B: Bay-Level Sensors & Guidance
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Telemetry</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-200">1. Ultrasonic / IR Proximity Sensor</span>
                <span className="text-[11px] text-slate-400">Mounted over Slot A-01..A-50</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 text-blue-500" />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-200">2. Overhead RGB LED Indicator</span>
                <span className="text-[11px] text-slate-400">Green = Free · Red = Occupied</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 text-blue-500" />
              </div>

              <div className="p-3 bg-blue-950/50 border border-blue-800/80 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-blue-300">3. SmartPark Cloud Datastore</span>
                <span className="text-[11px] text-blue-400">Atomic State Synchronization</span>
              </div>
              <div className="flex justify-center text-slate-600">
                <ArrowDown className="w-4 h-4 text-blue-500" />
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-slate-200">4. Real-time Driver Guidance UI</span>
                <span className="text-[11px] text-blue-400 font-semibold">Immediate Bay Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Future Capabilities Roadmap (Section 30) */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
            Future Expansion Roadmap
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <Camera className="w-4 h-4 text-emerald-400 mb-1" />
              <div className="font-semibold text-white">ANPR / LPR Cameras</div>
              <div className="text-[11px] text-slate-400">Automatic number plate recognition at barrier.</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <Zap className="w-4 h-4 text-amber-400 mb-1" />
              <div className="font-semibold text-white">EV Smart Charging</div>
              <div className="text-[11px] text-slate-400">Integrated power metering & charge slot reserve.</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <Gauge className="w-4 h-4 text-blue-400 mb-1" />
              <div className="font-semibold text-white">Dynamic Pricing</div>
              <div className="text-[11px] text-slate-400">Demand-responsive tariff for festival/rush hours.</div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
              <Radio className="w-4 h-4 text-purple-400 mb-1" />
              <div className="font-semibold text-white">Multi-Facility Fleet</div>
              <div className="text-[11px] text-slate-400">Unified civic grid for Vizag municipal areas.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
