import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Edit,
  FileText,
  Filter,
  LogIn,
  MoreVertical,
  Plus,
  Search,
  Users,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

type Guest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
};

type Room = {
  room_number: string;
  type: string;
  base_rate_cents: number;
  currency: string;
  archived_at: string | null;
};

type Reservation = {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email: string };
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  amount_cents: number;
  currency: string;
  payment_status: string;
  status: string;
  created_at: string;
};

type ModalMode = 'add' | 'edit';

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

function toDateOnly(value: string) {
  if (!value) return '';
  return String(value).split('T')[0];
}

export default function Reservations() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [guestSearch, setGuestSearch] = useState('');
  const [guestResults, setGuestResults] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    room_number: '',
    check_in_date: '',
    check_out_date: '',
    status: 'pending',
    payment_status: 'unpaid',
  });

  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.room_number === form.room_number) ?? null,
    [rooms, form.room_number]
  );

  const nights = useMemo(() => {
    if (!form.check_in_date || !form.check_out_date) return 0;
    const start = new Date(toDateOnly(form.check_in_date));
    const end = new Date(toDateOnly(form.check_out_date));
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [form.check_in_date, form.check_out_date]);

  const totalAmountCents = useMemo(() => {
    if (!selectedRoom || nights <= 0) return 0;
    return selectedRoom.base_rate_cents * nights;
  }, [selectedRoom, nights]);

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

  const fetchRooms = async (signal?: AbortSignal) => {
    const res = await api.get('/admin/rooms', {
      params: { per_page: 200, include_archived: 0 },
      signal,
    });
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setRooms(data);
  };

  const fetchReservations = async (signal?: AbortSignal) => {
    setError(null);
    const res = await api.get('/admin/reservations', {
      params: {
        search: searchTerm,
        per_page: 20,
        page,
        status: statusFilter,
        room_type: roomTypeFilter,
        sort_dir: sortDir,
      },
      signal,
    });

    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setReservations(data);

    const meta = res.data?.meta;
    if (meta?.last_page) setLastPage(meta.last_page);
    if (meta?.current_page) setPage(meta.current_page);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        await Promise.all([fetchRooms(controller.signal), fetchReservations(controller.signal)]);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load reservations.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchTerm, page, statusFilter, roomTypeFilter, sortDir]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-res-filters-root="1"]')) return;
      setShowFilters(false);
    };

    if (showFilters) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showFilters]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [openMenuId]);

  useEffect(() => {
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      const s = guestSearch.trim();
      if (s.length < 2) {
        setGuestResults([]);
        return;
      }
      try {
        const res = await api.get('/admin/guests', {
          params: { search: s, per_page: 10 },
          signal: controller.signal,
        });
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
        setGuestResults(data);
      } catch {
        // ignore search errors
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [guestSearch]);

  const openNew = () => {
    setModalMode('add');
    setSelectedReservation(null);
    setSelectedGuest(null);
    setGuestSearch('');
    setGuestResults([]);
    const defaultRoom = rooms[0]?.room_number ?? '';
    setForm({
      room_number: defaultRoom,
      check_in_date: '',
      check_out_date: '',
      status: 'pending',
      payment_status: 'unpaid',
    });
    setShowModal(true);
  };

  const openEdit = (r: Reservation) => {
    setModalMode('edit');
    setSelectedReservation(r);
    setSelectedGuest(null);
    setGuestSearch(r.user?.name ?? '');
    setGuestResults([]);
    setForm({
      room_number: r.room_number,
      check_in_date: toDateOnly(r.check_in_date),
      check_out_date: toDateOnly(r.check_out_date),
      status: r.status,
      payment_status: r.payment_status,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };

  const submitReservation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (modalMode === 'add' && !selectedGuest) {
      showToast('Please select a guest.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/admin/reservations', {
          user_id: selectedGuest!.id,
          room_number: form.room_number,
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          status: form.status,
          payment_status: form.payment_status,
        });
        showToast('New booking created successfully!', 'success');
      } else if (modalMode === 'edit' && selectedReservation) {
        await api.put(`/admin/reservations/${selectedReservation.id}`, {
          room_number: form.room_number,
          check_in_date: form.check_in_date,
          check_out_date: form.check_out_date,
          status: form.status,
          payment_status: form.payment_status,
        });
        showToast('Reservation updated.', 'success');
      }

      closeModal();
      await fetchReservations();
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Failed to save reservation.';
      showToast(String(message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmReservation = async (r: Reservation) => {
    try {
      await api.patch(`/admin/reservations/${r.id}/confirm`);
      showToast('Reservation confirmed.', 'success');
      await fetchReservations();
    } catch {
      showToast('Failed to confirm reservation.', 'error');
    }
  };

  const cancelReservation = async (r: Reservation) => {
    try {
      await api.patch(`/admin/reservations/${r.id}/cancel`);
      showToast('Reservation cancelled.', 'success');
      await fetchReservations();
    } catch {
      showToast('Failed to cancel reservation.', 'error');
    }
  };

  const checkInReservation = async (r: Reservation) => {
    try {
      await api.patch(`/admin/reservations/${r.id}`, { status: 'checked_in' });
      showToast('Guest checked in successfully.', 'success');
      setOpenMenuId(null);
      await fetchReservations();
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        'Failed to check in guest.';
      showToast(String(message), 'error');
    }
  };

  const viewReceipt = (r: Reservation) => {
    showToast('Receipt for RES-' + String(r.id).padStart(4, '0') + ': ' + formatMoney(r.amount_cents, r.currency), 'info');
    setOpenMenuId(null);
    // TODO: Implement receipt viewing modal or PDF generation
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Reservations</h1>
          <p className="text-forest-700/70 mt-1">Manage all bookings and room assignments (database-backed).</p>
        </div>
        <button
          onClick={openNew}
          className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
          <input
            type="text"
            placeholder="Search RES ID, guest, email, room, type..."
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative" data-res-filters-root="1">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 border border-earth-200 rounded-xl text-forest-800 hover:bg-earth-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>

            {showFilters && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-earth-200 shadow-xl p-4 z-20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-forest-900">Filters</div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('');
                      setRoomTypeFilter('');
                      setPage(1);
                    }}
                    className="text-xs text-forest-700/70 hover:text-forest-900"
                  >
                    Clear
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs font-medium text-forest-800">
                    Status
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setPage(1);
                        setStatusFilter(e.target.value);
                      }}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="checked_out">Checked out</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>

                  <label className="text-xs font-medium text-forest-800">
                    Room Type
                    <select
                      value={roomTypeFilter}
                      onChange={(e) => {
                        setPage(1);
                        setRoomTypeFilter(e.target.value);
                      }}
                      className="mt-1 w-full px-3 py-2 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none"
                    >
                      <option value="">All</option>
                      {Array.from(new Set(rooms.map((r) => r.type))).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-forest-700/70">Loading reservations...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="p-10 text-center text-forest-700/70">No reservations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-earth-50 text-forest-800 text-sm border-b border-earth-200">
                  <th className="p-4 font-medium">Reservation</th>
                  <th className="p-4 font-medium">Guest</th>
                  <th className="p-4 font-medium">Room</th>
                  <th className="p-4 font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
                      }}
                      className="inline-flex items-center gap-2 hover:text-forest-900 transition-colors"
                      title="Sort by check-in date"
                    >
                      Dates
                      <span className="text-xs text-forest-800/50">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    </button>
                  </th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-forest-900">
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b border-earth-100 last:border-none hover:bg-forest-50/50">
                    <td className="p-4 font-medium">RES-{String(r.id).padStart(4, '0')}</td>
                    <td className="p-4">
                      <div className="font-medium">{r.user?.name ?? `Guest #${r.user_id}`}</div>
                      <div className="text-xs text-forest-700/60">{r.user?.email ?? ''}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{r.room_number}</div>
                      <div className="text-xs text-forest-700/60">{r.room_type}</div>
                    </td>
                    <td className="p-4">
                      <div>{toDateOnly(r.check_in_date)}</div>
                      <div className="text-xs text-forest-700/60">to {toDateOnly(r.check_out_date)}</div>
                    </td>
                    <td className="p-4">{formatMoney(r.amount_cents, r.currency)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                        {titleCase(r.status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => confirmReservation(r)}
                          className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 text-earth-600 hover:bg-earth-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setReservationToCancel(r)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="relative" ref={openMenuId === r.id ? menuRef : undefined}>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                            className="p-1.5 text-forest-800 hover:bg-forest-50 rounded-lg transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === r.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -8 }}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-earth-200 shadow-lg overflow-hidden z-30"
                            >
                              <button
                                onClick={() => viewReceipt(r)}
                                className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-earth-50 transition-colors text-sm text-forest-800 border-b border-earth-100"
                              >
                                <FileText className="w-4 h-4 text-earth-600" />
                                <span>View Receipt</span>
                              </button>
                              {r.status !== 'checked_out' && r.status !== 'cancelled' && (
                                <button
                                  onClick={() => checkInReservation(r)}
                                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-earth-50 transition-colors text-sm text-forest-800"
                                >
                                  <LogIn className="w-4 h-4 text-forest-600" />
                                  <span>Check-in Guest</span>
                                </button>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-earth-100 flex items-center justify-between text-sm text-forest-700/70">
          <span>Page {page} of {lastPage}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={page >= lastPage}
              onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
              className="px-3 py-1 border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">
                  {modalMode === 'add' ? 'Create New Booking' : 'Edit Reservation'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto">
                <form onSubmit={submitReservation} className="space-y-8">
                  {modalMode === 'add' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Guest
                      </h3>
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                          <input
                            type="text"
                            placeholder="Search guest by name or email..."
                            value={guestSearch}
                            onChange={(e) => {
                              setGuestSearch(e.target.value);
                              setSelectedGuest(null);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                          />

                          {guestResults.length > 0 && !selectedGuest && (
                            <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl border border-earth-200 shadow-lg overflow-hidden z-10">
                              {guestResults.map((g) => (
                                <button
                                  type="button"
                                  key={g.id}
                                  onClick={() => {
                                    setSelectedGuest(g);
                                    setGuestSearch(g.name);
                                    setGuestResults([]);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-earth-50 transition-colors"
                                >
                                  <div className="font-medium text-forest-900">{g.name}</div>
                                  <div className="text-xs text-forest-700/60">{g.email}</div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {selectedGuest && (
                          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100">
                            <div className="text-sm font-medium text-forest-900">{selectedGuest.name}</div>
                            <div className="text-xs text-forest-700/60">{selectedGuest.email}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Booking Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-forest-800">Room</label>
                        <select
                          value={form.room_number}
                          onChange={(e) => setForm((p) => ({ ...p, room_number: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                        >
                          {rooms.map((r) => (
                            <option key={r.room_number} value={r.room_number}>
                              {r.room_number} - {r.type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-forest-800">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="checked_out">Checked Out</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-forest-800">Check-in</label>
                        <input
                          type="date"
                          value={form.check_in_date}
                          onChange={(e) => setForm((p) => ({ ...p, check_in_date: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-sm font-medium text-forest-800">Check-out</label>
                        <input
                          type="date"
                          value={form.check_out_date}
                          onChange={(e) => setForm((p) => ({ ...p, check_out_date: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-forest-800">Payment Status</label>
                        <select
                          value={form.payment_status}
                          onChange={(e) => setForm((p) => ({ ...p, payment_status: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-earth-50 p-4 rounded-2xl border border-earth-100 flex items-center justify-between">
                      <div className="text-sm text-forest-800">
                        Nights: <span className="font-semibold">{nights}</span>
                      </div>
                      <div className="text-sm text-forest-800">
                        Total: <span className="font-semibold">{formatMoney(totalAmountCents, selectedRoom?.currency ?? 'PHP')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 rounded-xl border border-earth-200 hover:bg-earth-50 text-forest-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-medium disabled:opacity-60"
                    >
                      {isSaving ? 'Saving...' : modalMode === 'add' ? 'Create Booking' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reservationToCancel && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReservationToCancel(null)}
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
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-forest-900">Confirm Cancel</div>
                    <div className="text-xs text-forest-700/60">RES-{String(reservationToCancel.id).padStart(4, '0')}</div>
                  </div>
                </div>
                <button
                  onClick={() => setReservationToCancel(null)}
                  className="p-2 hover:bg-earth-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-forest-800">Do you really want to cancel this reservation?</p>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setReservationToCancel(null)}
                    className="px-4 py-2 rounded-xl border border-earth-200 hover:bg-earth-50 text-forest-800"
                  >
                    No
                  </button>
                  <button
                    onClick={async () => {
                      const r = reservationToCancel;
                      setReservationToCancel(null);
                      await cancelReservation(r);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    Yes, cancel
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
