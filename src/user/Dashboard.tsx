import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  CreditCard,
  MapPin,
  Search,
  ArrowRight,
  Clock,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

type ProfileUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

type Booking = {
  id: number;
  reference: string;
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

function formatDateShort(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
}

function daysUntil(dateStr: string) {
  const start = new Date();
  const end = new Date(dateStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function getStatusColor(status: string) {
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
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [user, setUser] = useState<ProfileUser | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleManageBooking = () => {
    showToast("Redirecting to your bookings...", "info");
    setTimeout(() => navigate('/user/bookings'), 1000);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    (async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          api.get('/profile', { signal: controller.signal }),
          api.get('/bookings', { signal: controller.signal }),
        ]);

        const u = profileRes.data?.user as ProfileUser | undefined;
        if (u?.name) setUser(u);

        const list = Array.isArray(bookingsRes.data?.bookings) ? (bookingsRes.data.bookings as Booking[]) : [];
        setBookings(list);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load your dashboard.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const firstName = useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return 'Guest';
    return name.split(' ').filter(Boolean)[0] ?? 'Guest';
  }, [user?.name]);

  const upcomingStay = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = bookings
      .filter((b) => (b.status === 'confirmed' || b.status === 'pending') && new Date(b.check_in_date).getTime() >= today.getTime())
      .sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime());

    return upcoming[0] ?? null;
  }, [bookings]);

  const stats = useMemo(() => {
    const upcomingCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
    const pastCount = bookings.filter((b) => b.status === 'checked_out').length;
    const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
    const unpaidCount = bookings.filter((b) => b.payment_status !== 'paid' && (b.status === 'confirmed' || b.status === 'pending')).length;
    return { upcomingCount, pastCount, cancelledCount, unpaidCount };
  }, [bookings]);

  const recentActivity = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => {
      const at = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bt = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bt - at;
    });
    return sorted.slice(0, 3);
  }, [bookings]);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-forest-800 to-forest-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-forest-900/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-white/80 text-xs font-semibold tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              Brokenshire Hotel
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold">
              {timeGreeting()}, {firstName}
            </h1>
            <p className="text-white/80 text-sm max-w-2xl">
              Welcome to your guest dashboard. Find a room, manage your bookings, and get ready for a relaxing nature escape.
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Today</p>
            <p className="text-sm font-semibold">{new Intl.DateTimeFormat('en-PH', { dateStyle: 'full' }).format(new Date())}</p>
          </div>
        </div>

        {error && (
          <div className="relative mt-5 bg-red-500/15 border border-red-300/30 text-red-50 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-earth-100">
          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Upcoming</p>
          <p className="mt-2 text-2xl font-serif font-semibold text-forest-900">{isLoading ? '—' : stats.upcomingCount}</p>
          <p className="text-xs text-forest-700/60 mt-1">Bookings in progress</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-earth-100">
          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Unpaid</p>
          <p className="mt-2 text-2xl font-serif font-semibold text-forest-900">{isLoading ? '—' : stats.unpaidCount}</p>
          <p className="text-xs text-forest-700/60 mt-1">Pay at hotel</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-earth-100">
          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Past Stays</p>
          <p className="mt-2 text-2xl font-serif font-semibold text-forest-900">{isLoading ? '—' : stats.pastCount}</p>
          <p className="text-xs text-forest-700/60 mt-1">Completed reservations</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-earth-100">
          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Cancelled</p>
          <p className="mt-2 text-2xl font-serif font-semibold text-forest-900">{isLoading ? '—' : stats.cancelledCount}</p>
          <p className="text-xs text-forest-700/60 mt-1">Cancelled bookings</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/user/search" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center text-forest-600 mb-3 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">Find a Room</span>
        </Link>
        <Link to="/user/bookings" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center text-earth-600 mb-3 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">My Bookings</span>
        </Link>
        <Link to="/user/payments" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center text-forest-600 mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">Payments</span>
        </Link>
        <Link to="/user/profile" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center text-earth-600 mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">Profile</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Reservation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-forest-900">Upcoming Stay</h2>
            <Link to="/user/bookings" className="text-sm font-medium text-forest-600 hover:text-forest-800 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-forest-700/70">
              Loading your upcoming stay...
            </div>
          ) : upcomingStay ? (
            <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-1/3 h-48 sm:h-auto bg-earth-200 relative">
                {upcomingStay.image_url ? (
                  <img
                    src={upcomingStay.image_url}
                    alt={upcomingStay.room_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-earth-50" />
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-forest-900 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{' '}
                  {(() => {
                    const d = daysUntil(upcomingStay.check_in_date);
                    if (d < 0) return 'In progress';
                    if (d === 0) return 'Today';
                    if (d === 1) return 'Tomorrow';
                    return `In ${d} days`;
                  })()}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-xl font-serif font-semibold text-forest-900">{upcomingStay.room_name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(upcomingStay.status)}`}>
                      {titleCase(upcomingStay.status)}
                    </span>
                  </div>
                  <p className="text-forest-700/70 text-sm mb-4">Reservation #{upcomingStay.reference}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-forest-700/50 mb-1">Check-in</p>
                      <p className="font-medium text-forest-900">{formatDateShort(upcomingStay.check_in_date)}</p>
                      <p className="text-forest-700/70 text-xs">After 2:00 PM</p>
                    </div>
                    <div>
                      <p className="text-forest-700/50 mb-1">Check-out</p>
                      <p className="font-medium text-forest-900">{formatDateShort(upcomingStay.check_out_date)}</p>
                      <p className="text-forest-700/70 text-xs">Before 11:00 AM</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-earth-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-forest-700/50">Total Amount</p>
                    <p className="font-semibold text-forest-900">{formatMoney(upcomingStay.amount_cents, upcomingStay.currency)}</p>
                  </div>
                  <button
                    onClick={handleManageBooking}
                    className="px-4 py-2 bg-forest-50 text-forest-800 hover:bg-forest-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    Manage Booking
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-10 flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-serif font-semibold text-forest-900">No upcoming stays yet</p>
                <p className="text-sm text-forest-700/70 mt-1">
                  Let’s plan something relaxing. Search for available rooms and book your next retreat.
                </p>
                <div className="mt-4">
                  <Link
                    to="/user/search"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white hover:bg-forest-800 transition-colors text-sm font-medium"
                  >
                    Find a Room <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-forest-900">Recent Activity</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-6 space-y-6">
            {isLoading ? (
              <div className="text-sm text-forest-700/70">Loading recent activity...</div>
            ) : recentActivity.length === 0 ? (
              <div className="text-sm text-forest-700/70">No recent activity yet.</div>
            ) : (
              recentActivity.map((b) => {
                const icon =
                  b.payment_status === 'paid' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : b.status === 'cancelled' ? (
                    <MessageSquare className="w-5 h-5" />
                  ) : (
                    <CalendarDays className="w-5 h-5" />
                  );

                const iconWrap =
                  b.payment_status === 'paid'
                    ? 'bg-emerald-50 text-emerald-600'
                    : b.status === 'cancelled'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-forest-50 text-forest-600';

                const when = b.created_at ? formatDateShort(b.created_at) : '—';
                const title =
                  b.payment_status === 'paid'
                    ? 'Payment received'
                    : b.status === 'confirmed'
                      ? 'Booking confirmed'
                      : b.status === 'pending'
                        ? 'Booking created'
                        : `Booking ${titleCase(b.status)}`;

                const subtitle =
                  b.payment_status === 'paid'
                    ? `You paid ${formatMoney(b.amount_cents, b.currency)} for ${b.reference}`
                    : `${b.room_name} • ${formatDateShort(b.check_in_date)} → ${formatDateShort(b.check_out_date)}`;

                return (
                  <div key={b.id} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconWrap}`}>{icon}</div>
                    <div>
                      <p className="text-sm font-medium text-forest-900">{title}</p>
                      <p className="text-xs text-forest-700/70 mt-1">{subtitle}</p>
                      <p className="text-xs text-forest-700/50 mt-2">{when}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
