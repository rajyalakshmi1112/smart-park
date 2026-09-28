/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { DemoControls } from './components/common/DemoControls';
import { LandingHero } from './components/landing/LandingHero';
import { ParkingSearch } from './components/parking/ParkingSearch';
import { BookingWizard } from './components/booking/BookingWizard';
import { QRTicketCard } from './components/ticket/QRTicketCard';
import { MyBookingsView } from './components/ticket/MyBookingsView';
import { SmartEntryGate } from './components/gate/SmartEntryGate';
import { SmartExitGate } from './components/gate/SmartExitGate';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GeminiChatbot } from './components/chat/GeminiChatbot';
import { storageService, subscribeToStorage } from './services/storage';
import { ParkingFacility, ParkingSlot, Booking, GateEvent, VehicleType } from './types';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});

  // Core Data State (synchronized with persistent storageService)
  const [facilities, setFacilities] = useState<ParkingFacility[]>(() => storageService.getFacilities());
  const [slots, setSlots] = useState<ParkingSlot[]>(() => storageService.getSlots());
  const [bookings, setBookings] = useState<Booking[]>(() => storageService.getBookings());
  const [gateEvents, setGateEvents] = useState<GateEvent[]>(() => storageService.getGateEvents());

  // Gemini AI Chatbot State
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);

  // Demo Controls Modal (Admin access)
  const [isDemoControlsOpen, setIsDemoControlsOpen] = useState<boolean>(false);

  // Toast Notification State
  const [notification, setNotification] = useState<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Subscribe to storage changes for persistent real-time reactivity
  useEffect(() => {
    const syncData = () => {
      setFacilities(storageService.getFacilities());
      setSlots(storageService.getSlots());
      setBookings(storageService.getBookings());
      setGateEvents(storageService.getGateEvents());
    };

    syncData();
    const unsubscribe = subscribeToStorage(syncData);
    return () => unsubscribe();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotification({ id, message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  const handleNavigate = (view: string, extraData?: any) => {
    setCurrentView(view);
    setViewParams(extraData || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Facility selection for booking flow
  const handleSelectFacilityForBooking = (
    facility: ParkingFacility,
    searchParams: { date: string; entryTime: string; duration: number; vehicleType: VehicleType }
  ) => {
    handleNavigate('booking', {
      facility,
      searchParams
    });
  };

  const handleBookingSuccess = (createdBooking: Booking) => {
    showNotification(
      `Booking ${createdBooking.id} confirmed! Slot ${createdBooking.slotNumber} assigned.`,
      'success'
    );
    handleNavigate('ticket', { bookingId: createdBooking.id });
  };

  // Find active booking for ticket view
  const currentTicketBooking = viewParams.bookingId
    ? bookings.find((b) => b.id === viewParams.bookingId)
    : bookings.find((b) => b.status === 'CONFIRMED') || bookings[0];

  const activeConfirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white w-full overflow-x-hidden">
      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        activeBookingCount={activeConfirmedCount}
      />

      {/* Main Viewport Content Router */}
      <main className="flex-1">
        {/* VIEW: LANDING */}
        {currentView === 'landing' && (
          <div className="space-y-12">
            <LandingHero
              onNavigate={handleNavigate}
              onOpenChatbot={() => setIsChatbotOpen(true)}
              onOpenDemo={() => setIsDemoControlsOpen(true)}
            />
          </div>
        )}

        {/* VIEW: PARKING SEARCH */}
        {currentView === 'search' && (
          <ParkingSearch
            facilities={facilities}
            slots={slots}
            onSelectFacilityForBooking={handleSelectFacilityForBooking}
          />
        )}

        {/* VIEW: BOOKING WIZARD */}
        {currentView === 'booking' && viewParams.facility && (
          <BookingWizard
            facility={viewParams.facility}
            initialParams={viewParams.searchParams}
            onCancel={() => handleNavigate('search')}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        {/* VIEW: DIGITAL QR TICKET */}
        {currentView === 'ticket' && currentTicketBooking && (
          <QRTicketCard
            booking={currentTicketBooking}
            onBack={() => handleNavigate('my-bookings')}
            onNavigateToGate={(bookingId) =>
              handleNavigate('entry-gate', { prefillBookingId: bookingId, autoScan: true })
            }
          />
        )}

        {/* VIEW: CUSTOMER BOOKINGS LIST */}
        {currentView === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            onSelectBooking={(b) => handleNavigate('ticket', { bookingId: b.id })}
            onNavigateToEntryGate={(id) =>
              handleNavigate('entry-gate', { prefillBookingId: id, autoScan: true })
            }
            onNavigateToExitGate={(id) =>
              handleNavigate('exit-gate', { prefillBookingId: id })
            }
            onNavigateToSearch={() => handleNavigate('search')}
            onShowNotification={showNotification}
          />
        )}

        {/* VIEW: SMART ENTRY GATE */}
        {currentView === 'entry-gate' && (
          <SmartEntryGate
            facilities={facilities}
            prefillBookingId={viewParams.prefillBookingId}
            autoScan={viewParams.autoScan}
            onNavigateToTicket={(id) => handleNavigate('ticket', { bookingId: id })}
            onNavigateToExitGate={(id) => handleNavigate('exit-gate', { prefillBookingId: id })}
            onNavigateToAdmin={() => handleNavigate('admin')}
          />
        )}

        {/* VIEW: SMART EXIT GATE */}
        {currentView === 'exit-gate' && (
          <SmartExitGate
            prefillBookingId={viewParams.prefillBookingId}
            onNavigateToSearch={() => handleNavigate('search')}
            onNavigateToAdmin={() => handleNavigate('admin')}
            onNavigateToEntryGate={() => handleNavigate('entry-gate')}
          />
        )}

        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard
            facilities={facilities}
            slots={slots}
            bookings={bookings}
            gateEvents={gateEvents}
            onInspectTicket={(id) => handleNavigate('ticket', { bookingId: id })}
            onOpenDemoControls={() => setIsDemoControlsOpen(true)}
            onShowNotification={showNotification}
          />
        )}
      </main>

      {/* Demo Controls Modal Dialog */}
      <DemoControls
        isOpen={isDemoControlsOpen}
        onClose={() => setIsDemoControlsOpen(false)}
        onNavigate={handleNavigate}
        onShowNotification={showNotification}
      />

      {/* Floating SmartPark AI Concierge (Gemini & Google Maps Grounded) */}
      <aside aria-label="SmartPark AI Assistant" className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 text-xs font-semibold group cursor-pointer"
          title="Ask SmartPark AI Concierge (Gemini 3.5 & Google Maps Grounded)"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span>Ask Vizag AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      </aside>

      {/* Gemini AI Multi-Turn Chatbot Modal */}
      <GeminiChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onNavigateToBooking={(facilityId) => handleNavigate('search', { facilityId })}
      />

      {/* Quiet Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Toast Notification Container */}
      {notification && (
        <div role="region" aria-label="Status notifications" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 pointer-events-none">
          <div
            className={`pointer-events-auto p-4 rounded-xl shadow-2xl border text-xs flex items-center justify-between gap-3 ${
              notification.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-700'
                : notification.type === 'error'
                  ? 'bg-rose-950 text-rose-100 border-rose-700'
                  : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span>{notification.message}</span>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
