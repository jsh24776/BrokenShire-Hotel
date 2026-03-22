import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Calendar, ShieldCheck, XCircle, CheckCircle, X } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';

type Booking = {
  id: number;
  reference: string;
  invoice_number?: string | null;
  room_number: string;
  room_name: string;
  room_type: string;
  image_url: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  amount_cents: number;
  currency: string;
  payment_status: string;
  status: string;
  created_at: string | null;
};

function formatMoney(cents: number, currency: string) {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(value);
  } catch {
    return `₱${value.toLocaleString()}`;
  }
}

function titleCase(s: string) {
  return String(s)
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function MyBookings() {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async (signal?: AbortSignal) => {
    setError(null);
    const res = await api.get('/bookings', { signal });
    setBookings(Array.isArray(res.data?.bookings) ? res.data.bookings : []);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    (async () => {
      try {
        await fetchBookings(controller.signal);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load your bookings.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'upcoming') return bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
    if (activeTab === 'past') return bookings.filter((b) => b.status === 'checked_out');
    if (activeTab === 'cancelled') return bookings.filter((b) => b.status === 'cancelled');
    return bookings;
  }, [activeTab, bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'checked_out':
        return 'bg-slate-100 text-slate-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-earth-100 text-earth-800';
    }
  };

  const cancelBooking = async (booking: Booking) => {
    setIsCancelling(true);
    try {
      await api.patch(`/bookings/${booking.id}/cancel`);
      showToast(`Booking ${booking.reference} has been cancelled.`, 'success');
      await fetchBookings();
      setSelectedBooking(null);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        'Failed to cancel booking.';
      showToast(String(message), 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">My Bookings</h1>
        <p className="text-forest-700/70 mt-1">Manage your upcoming stays and view past reservations.</p>
      </div>

      <div className="flex gap-2 border-b border-earth-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'upcoming' ? 'text-forest-900' : 'text-forest-700/50 hover:text-forest-700'
          }`}
        >
          Upcoming
          {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'past' ? 'text-forest-900' : 'text-forest-700/50 hover:text-forest-700'
          }`}
        >
          Past Stays
          {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${
            activeTab === 'cancelled' ? 'text-forest-900' : 'text-forest-700/50 hover:text-forest-700'
          }`}
        >
          Cancelled
          {activeTab === 'cancelled' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 rounded-t-full" />}
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-forest-700/70">
            Loading your bookings...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-red-600">{error}</div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow"
            >
              <div className="sm:w-48 h-48 sm:h-auto shrink-0">
                {booking.image_url ? (
                  <img
                    src={booking.image_url}
                    alt={booking.room_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-earth-50" />
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-forest-900">{booking.room_name}</h3>
                    <p className="text-sm text-forest-700/60">Reservation #{booking.reference}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {titleCase(booking.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-forest-700/70">
                      <Calendar className="w-4 h-4" />
                      {booking.check_in_date} → {booking.check_out_date}
                    </div>
                    <div className="text-xs text-forest-700/60">{booking.nights} nights</div>
                  </div>
                  <div className="space-y-1 text-sm sm:text-right">
                    <div className="text-forest-700/70">Total</div>
                    <div className="font-semibold text-forest-900">{formatMoney(booking.amount_cents, booking.currency)}</div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="px-4 py-2 bg-forest-50 text-forest-800 hover:bg-forest-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => setBookingToCancel(booking)}
                      className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-earth-50 rounded-full flex items-center justify-center text-earth-400 mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-forest-900 mb-1">No bookings found</h3>
            <p className="text-forest-700/70 text-sm max-w-sm">You don't have any {activeTab} reservations at the moment.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Booking Details</h2>
                <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  {selectedBooking.image_url ? (
                    <img
                      src={selectedBooking.image_url}
                      alt={selectedBooking.room_name}
                      className="w-24 h-24 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-earth-50" />
                  )}
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-forest-900">{selectedBooking.room_name}</h3>
                    <p className="text-sm text-forest-700/60">
                      Reservation #{selectedBooking.reference}
                      {selectedBooking.invoice_number ? (
                        <span className="text-forest-700/40"> • {selectedBooking.invoice_number}</span>
                      ) : null}
                    </p>
                    <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                      {titleCase(selectedBooking.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-y border-earth-100">
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-in</p>
                    <p className="font-medium text-forest-900">{selectedBooking.check_in_date}</p>
                    <p className="text-xs text-forest-700/60">After 2:00 PM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-out</p>
                    <p className="font-medium text-forest-900">{selectedBooking.check_out_date}</p>
                    <p className="text-xs text-forest-700/60">Before 11:00 AM</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Nights</span>
                    <span className="font-medium text-forest-900">{selectedBooking.nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Total Amount</span>
                    <span className="font-semibold text-forest-900">{formatMoney(selectedBooking.amount_cents, selectedBooking.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Payment</span>
                    <span className="font-medium text-forest-900">{titleCase(selectedBooking.payment_status)}</span>
                  </div>
                </div>

                <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-forest-600 mt-0.5" />
                  <p className="text-xs text-forest-800/80 leading-relaxed">
                    This booking is protected by our Nature Retreat Guarantee. Need help? Contact our 24/7 concierge.
                  </p>
                </div>

                {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                  <button
                    onClick={() => setBookingToCancel(selectedBooking)}
                    className="w-full px-4 py-3 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingToCancel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBookingToCancel(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-earth-100"
            >
              <div className="p-6 border-b border-earth-100 bg-earth-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-700 flex items-center justify-center border border-red-100">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-forest-900">Confirm Cancel</div>
                    <div className="text-xs text-forest-700/60">{bookingToCancel.reference}</div>
                  </div>
                </div>
                <button onClick={() => setBookingToCancel(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-forest-800">Do you really want to cancel this booking?</p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setBookingToCancel(null)}
                    className="px-4 py-2 rounded-xl border border-earth-200 hover:bg-earth-50 text-forest-800"
                  >
                    No
                  </button>
                  <button
                    onClick={async () => {
                      const b = bookingToCancel;
                      setBookingToCancel(null);
                      await cancelBooking(b);
                    }}
                    disabled={isCancelling}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-60"
                  >
                    {isCancelling ? 'Cancelling...' : 'Yes, cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
