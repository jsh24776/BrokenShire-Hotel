import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Home,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../lib/api';
import { useSearchParams } from 'react-router-dom';
type Room = {
  room_number: string;
  display_name: string | null;
  type: string;
  floor: number;
  capacity: number;
  size: string | null;
  description: string | null;
  image_url: string | null;
  base_rate_cents: number;
  currency: string;
  amenities: string[];
  available: boolean;
};

type BookingReceipt = {
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
  payment_method: 'hotel' | 'paypal';
  payment_reference: string | null;
  payment_status: string;
  status: string;
  created_at: string | null;
};

const AMENITY_LABELS: Record<string, string> = {
  ac: 'AC',
  wifi: 'Free Wi-Fi',
  tv: 'TV',
  forest_view: 'Forest View',
  garden_view: 'Garden View',
  tree_view: 'Tree View',
  mini_bar: 'Mini Bar',
  jacuzzi: 'Jacuzzi',
  kitchen: 'Kitchen',
  outdoor_bath: 'Outdoor Bath',
  private_pool: 'Private Pool',
  coffee_maker: 'Coffee Maker',
  breakfast: 'Breakfast',
  king_bed: 'King Bed',
  queen_bed: 'Queen Bed',
  two_king_beds: '2 King Beds',
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

function paymentMethodLabel(method: 'hotel' | 'paypal') {
  return method === 'hotel' ? 'Pay at the hotel' : 'PayPal';
}

export default function SearchRooms() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState('2');
  const [preferredType, setPreferredType] = useState<string | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  const [selectedRoomNumber, setSelectedRoomNumber] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState(1);

  const [guestDetails, setGuestDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [receipt, setReceipt] = useState<BookingReceipt | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'hotel' | 'paypal'>('hotel');
  const [paypalInvoiceId, setPaypalInvoiceId] = useState<string | null>(null);
  const [paypalPaid, setPaypalPaid] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.room_number === selectedRoomNumber) ?? null,
    [selectedRoomNumber, rooms]
  );

  const pricing = useMemo(() => {
    if (!selectedRoom || !dates.checkIn || !dates.checkOut) return { totalCents: 0, nights: 0 };

    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return { totalCents: 0, nights: 0 };

    const totalCents = selectedRoom.base_rate_cents * nights;
    return { totalCents, nights };
  }, [selectedRoom, dates]);

  const fetchRooms = async (signal?: AbortSignal) => {
    setRoomsError(null);

    const params: any = { guests: Number(guests) || 0 };
    if (dates.checkIn && dates.checkOut) {
      params.check_in_date = dates.checkIn;
      params.check_out_date = dates.checkOut;
    }

    const res = await api.get('/rooms', { params, signal });
    setRooms(Array.isArray(res.data?.rooms) ? res.data.rooms : []);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingRooms(true);

    const timer = window.setTimeout(async () => {
      try {
        await fetchRooms(controller.signal);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load rooms.';
        setRoomsError(String(message));
      } finally {
        setIsLoadingRooms(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const type = searchParams.get('type');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');

    if (type) setPreferredType(type);
    if (checkIn || checkOut) {
      setDates((prev) => ({
        ...prev,
        checkIn: checkIn ?? prev.checkIn,
        checkOut: checkOut ?? prev.checkOut,
      }));
    }
    if (guestsParam) setGuests(guestsParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      if (!dates.checkIn || !dates.checkOut) return;
      try {
        await fetchRooms(controller.signal);
      } catch {
        // ignore
      }
    }, 400);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dates.checkIn, dates.checkOut, guests]);
  useEffect(() => {
    if (!preferredType) return;
    if (selectedRoomNumber) return;
    const match = rooms.find((r) => r.type === preferredType && r.available) ?? rooms.find((r) => r.type === preferredType);
    if (match) setSelectedRoomNumber(match.room_number);
  }, [preferredType, rooms, selectedRoomNumber]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await api.get('/profile', { signal: controller.signal });
        const user = res.data?.user;
        if (!user) return;
        setGuestDetails((prev) => ({
          ...prev,
          fullName: user.name ?? prev.fullName,
          email: user.email ?? prev.email,
          phone: user.phone ?? prev.phone,
        }));
      } catch {
        // ignore (not logged in)
      }
    })();

    return () => controller.abort();
  }, []);

  const handleSearch = async () => {
    if (!dates.checkIn || !dates.checkOut) {
      showToast('Please select check-in and check-out dates', 'error');
      return;
    }

    setIsLoadingRooms(true);
    try {
      await fetchRooms();
      showToast('Showing available rooms for your dates.', 'success');
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        'Search failed.';
      showToast(String(message), 'error');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleBookNow = (roomNumber: string) => {
    setSelectedRoomNumber(roomNumber);
    setBookingStep(1);
    setAcceptedTerms(false);
    setPaymentMethod('hotel');
    setPaypalInvoiceId(null);
    setPaypalPaid(false);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRoom) return;

    if (!dates.checkIn || !dates.checkOut || pricing.nights <= 0) {
      showToast('Please select valid check-in and check-out dates', 'error');
      return;
    }

    if (!acceptedTerms) {
      showToast('Please accept the Terms & Conditions', 'error');
      return;
    }

    if (paymentMethod === 'paypal' && !paypalPaid) {
      showToast('Please complete the PayPal payment first.', 'error');
      return;
    }

    setIsBooking(true);
    try {
      const res = await api.post('/bookings', {
        room_number: selectedRoom.room_number,
        check_in_date: dates.checkIn,
        check_out_date: dates.checkOut,
        guests: Number(guests),
        payment_method: paymentMethod,
        payment_reference: paymentMethod === 'paypal' ? paypalInvoiceId : null,
      });

      const booking = res.data?.booking as BookingReceipt | undefined;
      if (!booking) throw new Error('Missing booking response');

      setReceipt(booking);
      showToast(`Booking ${booking.reference} created!`, 'success');

      setSelectedRoomNumber(null);
      setBookingStep(1);
      setAcceptedTerms(false);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Booking failed.';
      showToast(String(message), 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const downloadPaypalInvoicePdf = () => {
    if (!selectedRoom) return;

    const invoiceId = paypalInvoiceId ?? `PP-${Date.now()}`;
    const total = formatMoney(pricing.totalCents, selectedRoom.currency);

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${invoiceId} Invoice</title>
        <style>
          :root { color-scheme: light; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 24px; color: #0b2a1f; }
          .card { border: 1px solid #eadfd2; border-radius: 16px; overflow: hidden; max-width: 860px; margin: 0 auto; }
          .header { background: linear-gradient(90deg, #003087, #009CDE); padding: 18px 20px; color: white; display:flex; justify-content:space-between; align-items:center; }
          .title { font-size: 18px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
          .sub { font-size: 12px; opacity: .9; margin-top: 4px; }
          .content { padding: 20px; background: #ffffff; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
          .box { background: #fbfaf8; border: 1px solid #eadfd2; border-radius: 14px; padding: 12px; }
          .label { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #6f6a63; font-weight: 800; }
          .value { margin-top: 6px; font-size: 14px; font-weight: 800; }
          .muted { font-size: 12px; color: #456b60; margin-top: 2px; }
          .totals { margin-top: 16px; border-top: 1px solid #eadfd2; padding-top: 14px; }
          .row { display:flex; justify-content:space-between; font-size: 13px; margin-top: 8px; }
          .row strong { font-weight: 900; }
          .note { margin-top: 16px; background: #eef6f2; border: 1px solid #d8efe5; border-radius: 14px; padding: 12px; font-size: 12px; color: #1f4a3b; }
          @media print { body { padding: 0; } .card { border: none; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <div>
              <div class="title">PayPal Invoice</div>
              <div class="sub">Invoice ID: ${invoiceId}</div>
            </div>
            <div class="sub">${new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(new Date())}</div>
          </div>
          <div class="content">
            <div class="grid">
              <div class="box">
                <div class="label">Guest</div>
                <div class="value">${guestDetails.fullName || '—'}</div>
                <div class="muted">${guestDetails.email || '—'}</div>
              </div>
              <div class="box">
                <div class="label">Room</div>
                <div class="value">${selectedRoom.display_name ?? selectedRoom.type} (Room ${selectedRoom.room_number})</div>
                <div class="muted">${dates.checkIn} → ${dates.checkOut} • ${pricing.nights} night(s)</div>
              </div>
            </div>

            <div class="totals">
              <div class="row"><span>Booking Total</span><strong>${total}</strong></div>
            </div>

            <div class="note">This is a simulated PayPal invoice for the Brokenshire Hotel student project.</div>
          </div>
        </div>
        <script>window.onload = () => { window.focus(); window.print(); };</script>
      </body>
    </html>`;

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Find Your Retreat</h1>
        <p className="text-forest-700/70 mt-1">Discover the perfect room for your next nature getaway.</p>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <label className="text-xs font-medium text-forest-700/70 absolute top-2 left-4">Check-in</label>
          <input
            type="date"
            value={dates.checkIn}
            onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
            className="w-full pt-6 pb-2 px-4 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent"
          />
        </div>
        <div className="flex-1 relative">
          <label className="text-xs font-medium text-forest-700/70 absolute top-2 left-4">Check-out</label>
          <input
            type="date"
            value={dates.checkOut}
            onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
            className="w-full pt-6 pb-2 px-4 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent"
          />
        </div>
        <div className="flex-1 relative">
          <label className="text-xs font-medium text-forest-700/70 absolute top-2 left-4">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="w-full pt-6 pb-2 px-4 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent appearance-none"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="bg-forest-700 hover:bg-forest-800 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {isLoadingRooms ? (
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-forest-700/70">
          Loading rooms...
        </div>
      ) : roomsError ? (
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-red-600">
          {roomsError}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const name = room.display_name ?? room.type;
            const price = room.base_rate_cents / 100;
            const amenityLabels = (room.amenities ?? [])
              .map((a) => AMENITY_LABELS[a] ?? a)
              .filter(Boolean);

            return (
              <div
                key={room.room_number}
                className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden group hover:shadow-md transition-all flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  {room.image_url ? (
                    <img
                      src={room.image_url}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-earth-50" />
                  )}

                  {!room.available && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-forest-900 text-white px-4 py-2 rounded-full font-medium text-sm">Sold Out</span>
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-semibold text-forest-900">{name}</h3>
                    <div className="text-right">
                      <span className="text-lg font-semibold text-forest-900">₱{price.toLocaleString()}</span>
                      <span className="text-xs text-forest-700/70 block">/ night</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-forest-700/70 mb-4">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.capacity}</span>
                    <span className="flex items-center gap-1"><Search className="w-4 h-4" /> {room.size ?? '—'}</span>
                  </div>

                  <p className="text-sm text-forest-700/80 mb-6 line-clamp-2 flex-1">{room.description ?? '—'}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {amenityLabels.slice(0, 3).map((amenity, i) => (
                      <span key={i} className="bg-earth-50 text-forest-800 text-xs px-2 py-1 rounded-md border border-earth-100">
                        {amenity}
                      </span>
                    ))}
                    {amenityLabels.length > 3 && (
                      <span className="bg-earth-50 text-forest-800 text-xs px-2 py-1 rounded-md border border-earth-100">
                        +{amenityLabels.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      className="flex-1 border border-forest-200 text-forest-800 hover:bg-forest-50 py-2.5 rounded-xl font-medium transition-colors text-sm"
                      onClick={() => setSelectedRoomNumber(room.room_number)}
                    >
                      View Details
                    </button>
                    <button
                      disabled={!room.available}
                      onClick={() => handleBookNow(room.room_number)}
                      className="flex-1 bg-forest-700 hover:bg-forest-800 disabled:bg-earth-200 disabled:text-forest-800/40 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedRoomNumber && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoomNumber(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-forest-900">Book Your Stay</h2>
                  <p className="text-sm text-forest-700/60">{selectedRoom?.display_name ?? selectedRoom?.type}</p>
                </div>
                <button onClick={() => setSelectedRoomNumber(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="flex border-b border-earth-100">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-1.5 transition-colors ${step <= bookingStep ? 'bg-forest-600' : 'bg-earth-100'}`}
                  />
                ))}
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {bookingStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-earth-50 p-6 rounded-2xl border border-earth-100 space-y-4">
                        <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                          <Home className="w-4 h-4" />
                          Selected Room
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Room Number</p>
                            <p className="text-lg font-bold text-forest-900">{selectedRoom?.room_number}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Room Type</p>
                            <p className="text-lg font-bold text-forest-900">{selectedRoom?.display_name ?? selectedRoom?.type}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Rate per Night</p>
                            <p className="text-lg font-bold text-forest-900">
                              {selectedRoom ? formatMoney(selectedRoom.base_rate_cents, selectedRoom.currency) : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-forest-600 mt-0.5" />
                        <p className="text-sm text-forest-800/80 leading-relaxed">
                          You selected {selectedRoom?.display_name ?? selectedRoom?.type}. Click next to provide your stay details.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-forest-800">Check-in Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                            <input
                              type="date"
                              value={dates.checkIn}
                              onChange={(e) => setDates({ ...dates, checkIn: e.target.value })}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-forest-800">Check-out Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                            <input
                              type="date"
                              value={dates.checkOut}
                              onChange={(e) => setDates({ ...dates, checkOut: e.target.value })}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-forest-800">Number of Nights</label>
                          <div className="w-full px-4 py-2.5 rounded-xl border border-earth-100 bg-earth-50 text-forest-900 font-bold">
                            {pricing.nights > 0 ? pricing.nights : 0} Nights
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-forest-800">Number of Guests</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                            <select
                              value={guests}
                              onChange={(e) => setGuests(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none appearance-none bg-white"
                            >
                              <option value="1">1 Guest</option>
                              <option value="2">2 Guests</option>
                              <option value="3">3 Guests</option>
                              <option value="4">4 Guests</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Full Name</label>
                          <input
                            type="text"
                            value={guestDetails.fullName}
                            onChange={(e) => setGuestDetails({ ...guestDetails, fullName: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-forest-800">Email Address</label>
                            <input
                              type="email"
                              value={guestDetails.email}
                              onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-forest-800">Phone Number</label>
                            <input
                              type="tel"
                              value={guestDetails.phone}
                              onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Special Requests (Optional)</label>
                          <textarea
                            rows={3}
                            value={guestDetails.specialRequests}
                            onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                            placeholder="e.g. Early check-in, extra pillows..."
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="bg-earth-50 p-6 rounded-2xl border border-earth-100 space-y-6">
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Payment</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentMethod('hotel');
                                setPaypalInvoiceId(null);
                                setPaypalPaid(false);
                                setIsPaying(false);
                              }}
                              className={`p-4 bg-white rounded-xl border text-left transition-colors ${
                                paymentMethod === 'hotel'
                                  ? 'border-forest-500 ring-2 ring-forest-500/20'
                                  : 'border-earth-200 hover:bg-earth-50'
                              }`}
                            >
                              <p className="font-bold text-forest-900">Pay at the hotel</p>
                              <p className="text-[10px] text-forest-700/60">Pay on arrival. Status updates on check-in.</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setPaymentMethod('paypal');
                                if (!paypalInvoiceId) {
                                  setPaypalInvoiceId(`PP-${Date.now()}`);
                                }
                              }}
                              className={`p-4 bg-white rounded-xl border text-left transition-colors ${
                                paymentMethod === 'paypal'
                                  ? 'border-forest-500 ring-2 ring-forest-500/20'
                                  : 'border-earth-200 hover:bg-earth-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-forest-900">PayPal</p>
                                  <p className="text-[10px] text-forest-700/60">Pay now to confirm instantly.</p>
                                </div>
                                <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center text-white font-bold italic text-xs">
                                  PayPal
                                </div>
                              </div>
                            </button>
                          </div>

                          {paymentMethod === 'paypal' && (
                            <div className="p-4 bg-white rounded-xl border border-earth-200">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="text-xs font-semibold text-forest-900">PayPal Invoice</p>
                                  <p className="text-[10px] text-forest-700/60 mt-1">
                                    Invoice ID: <span className="font-semibold text-forest-900">{paypalInvoiceId ?? '—'}</span>
                                  </p>
                                </div>
                                {paypalPaid ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                    Paid
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                    Unpaid
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 bg-earth-50 p-4 rounded-xl border border-earth-100">
                                <div className="flex justify-between text-sm">
                                  <span className="text-forest-700/70">Booking Total</span>
                                  <span className="font-semibold text-forest-900">
                                    {selectedRoom ? formatMoney(pricing.totalCents, selectedRoom.currency) : '—'}
                                  </span>
                                </div>
                                <div className="text-[10px] text-forest-700/60 mt-1">
                                  This is a simulated PayPal flow for the student project.
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3">
                                <button
                                  type="button"
                                  onClick={downloadPaypalInvoicePdf}
                                  className="px-4 py-2 rounded-xl border border-earth-200 text-forest-800 hover:bg-earth-50 text-sm font-medium"
                                >
                                  Download Invoice PDF
                                </button>
                                <button
                                  type="button"
                                  disabled={paypalPaid || isPaying || pricing.nights <= 0}
                                  onClick={async () => {
                                    if (!paypalInvoiceId) setPaypalInvoiceId(`PP-${Date.now()}`);
                                    setIsPaying(true);
                                    await new Promise((r) => setTimeout(r, 1200));
                                    setPaypalPaid(true);
                                    setIsPaying(false);
                                    showToast('PayPal payment completed.', 'success');
                                  }}
                                  className="px-4 py-2 rounded-xl bg-[#003087] hover:bg-[#001C64] text-white text-sm font-medium disabled:opacity-60"
                                >
                                  {paypalPaid ? 'Paid' : isPaying ? 'Processing�' : 'Pay Now'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-4 border-t border-earth-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-forest-700/70">Rate per Night</span>
                            <span className="font-medium text-forest-900">
                              {selectedRoom ? formatMoney(selectedRoom.base_rate_cents, selectedRoom.currency) : '—'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-forest-700/70">Number of Nights</span>
                            <span className="font-medium text-forest-900">{pricing.nights}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-earth-200">
                            <span className="font-bold text-forest-900">Total Amount</span>
                            <span className="text-3xl font-serif font-bold text-forest-900">
                              {selectedRoom ? formatMoney(pricing.totalCents, selectedRoom.currency) : '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {bookingStep === 5 && (
                    <motion.div
                      key="step5"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <h3 className="font-serif font-bold text-forest-900 text-lg">Review Your Booking</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Stay Details</p>
                            <p className="font-bold text-forest-900">{dates.checkIn} to {dates.checkOut}</p>
                            <p className="text-xs text-forest-700/60">{pricing.nights} Nights • {guests} Guests</p>
                          </div>
                          <div className="bg-earth-50 p-4 rounded-xl border border-earth-100">
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Room Details</p>
                            <p className="font-bold text-forest-900">{selectedRoom?.display_name ?? selectedRoom?.type}</p>
                            <p className="text-xs text-forest-700/60">Room {selectedRoom?.room_number}</p>
                          </div>
                          <div className="bg-earth-50 p-4 rounded-xl border border-earth-100 col-span-2">
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Guest Information</p>
                            <p className="font-bold text-forest-900">{guestDetails.fullName}</p>
                            <p className="text-xs text-forest-700/60">{guestDetails.email} • {guestDetails.phone}</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-earth-100">
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="mt-1">
                              <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="w-4 h-4 rounded border-earth-300 text-forest-600 focus:ring-forest-500"
                              />
                            </div>
                            <span className="text-xs text-forest-700 leading-relaxed group-hover:text-forest-900 transition-colors">
                              I agree to the <span className="underline font-medium">Terms & Conditions</span> and{' '}
                              <span className="underline font-medium">Privacy Policy</span> of Brokenshire Hotel.
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 border-t border-earth-100 bg-earth-50/30 flex justify-between gap-4">
                {bookingStep > 1 ? (
                  <button
                    onClick={() => setBookingStep((prev) => prev - 1)}
                    className="px-6 py-3 rounded-xl border border-earth-200 text-forest-800 hover:bg-white transition-colors flex items-center gap-2 font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {bookingStep < 5 ? (
                  <button
                    onClick={() => {
                      if (bookingStep === 2 && (!dates.checkIn || !dates.checkOut || pricing.nights <= 0)) {
                        showToast('Please select valid check-in and check-out dates', 'error');
                        return;
                      }
                      if (bookingStep === 4 && paymentMethod === 'paypal' && !paypalPaid) {
                        showToast('Please complete the PayPal payment first.', 'error');
                        return;
                      }
                      setBookingStep((prev) => prev + 1);
                    }}
                    className="px-8 py-3 rounded-xl bg-forest-700 text-white hover:bg-forest-800 transition-colors flex items-center gap-2 font-medium"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isBooking || !acceptedTerms}
                    className="px-8 py-3 rounded-xl bg-forest-700 text-white hover:bg-forest-800 transition-colors flex items-center gap-2 font-medium disabled:opacity-50 shadow-lg shadow-forest-900/20"
                  >
                    {isBooking ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm Booking
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receipt && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceipt(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-forest-900">Booking Receipt</h2>
                  <p className="text-sm text-forest-700/60">
                    {receipt.reference}
                    {receipt.invoice_number ? <span className="text-forest-700/40"> • {receipt.invoice_number}</span> : null}
                  </p>
                </div>
                <button onClick={() => setReceipt(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  {receipt.image_url ? (
                    <img
                      src={receipt.image_url}
                      alt={receipt.room_name}
                      className="w-24 h-24 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-earth-50" />
                  )}
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-forest-900">{receipt.room_name}</h3>
                    <p className="text-sm text-forest-700/60">Room {receipt.room_number}</p>
                    <span
                      className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {titleCase(receipt.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-y border-earth-100">
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-in</p>
                    <p className="font-medium text-forest-900">{receipt.check_in_date}</p>
                    <p className="text-xs text-forest-700/60">After 2:00 PM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-out</p>
                    <p className="font-medium text-forest-900">{receipt.check_out_date}</p>
                    <p className="text-xs text-forest-700/60">Before 11:00 AM</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Nights</span>
                    <span className="font-medium text-forest-900">{receipt.nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Total Amount</span>
                    <span className="font-semibold text-forest-900">
                      {formatMoney(receipt.amount_cents, receipt.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Payment Method</span>
                    <span className="font-medium text-forest-900">{paymentMethodLabel(receipt.payment_method)}</span>
                  </div>
                  {receipt.payment_method === 'paypal' && receipt.payment_reference && (
                    <div className="flex justify-between text-sm">
                      <span className="text-forest-700/70">PayPal Invoice</span>
                      <span className="font-medium text-forest-900">{receipt.payment_reference}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Payment Status</span>
                    <span className="font-medium text-forest-900">{titleCase(receipt.payment_status)}</span>
                  </div>
                </div>

                <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-forest-600 mt-0.5" />
                  <p className="text-xs text-forest-800/80 leading-relaxed">
                    Keep this receipt for your reference. You can view all your bookings anytime in{' '}
                    <span className="font-semibold">My Bookings</span>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
