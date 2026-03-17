import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search, Mail, Phone, User, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

type Guest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  created_at: string;
  updated_at: string;
};

type Reservation = {
  id: number;
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

export default function Guests() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [history, setHistory] = useState<Reservation[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const fetchGuests = async (search: string, signal?: AbortSignal) => {
    setError(null);
    const res = await api.get('/admin/guests', {
      params: { search, per_page: 50 },
      signal,
    });

    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setGuests(data);
  };

  const fetchHistory = async (guestId: number, signal?: AbortSignal) => {
    setHistoryError(null);
    const res = await api.get(`/admin/guests/${guestId}/history`, { signal });
    setHistory(Array.isArray(res.data?.reservations) ? res.data.reservations : []);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        await fetchGuests(searchTerm, controller.signal);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;

        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load guests.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchTerm]);

  const filteredGuests = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return guests;
    return guests.filter((g) =>
      [g.name, g.email, g.phone, String(g.id)].some((v) => v.toLowerCase().includes(s))
    );
  }, [guests, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Guest Directory</h1>
          <p className="text-forest-700/70 mt-1">All registered guests (from the database).</p>
        </div>

        <button
          onClick={async () => {
            try {
              setIsLoading(true);
              await fetchGuests(searchTerm);
              showToast('Guest list refreshed.', 'success');
            } catch {
              showToast('Failed to refresh guest list.', 'error');
            } finally {
              setIsLoading(false);
            }
          }}
          className="bg-white hover:bg-earth-50 text-forest-800 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 border border-earth-100"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-700/40" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone, ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-forest-700/70">Loading guests...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : filteredGuests.length === 0 ? (
          <div className="p-10 text-center text-forest-700/70">No guests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earth-50">
                <tr>
                  <th className="text-left p-4 text-xs font-medium text-forest-700 uppercase tracking-wider">Guest</th>
                  <th className="text-left p-4 text-xs font-medium text-forest-700 uppercase tracking-wider">Contact</th>
                  <th className="text-left p-4 text-xs font-medium text-forest-700 uppercase tracking-wider">Address</th>
                  <th className="text-left p-4 text-xs font-medium text-forest-700 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100">
                {filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="hover:bg-earth-50/50 cursor-pointer transition-colors"
                    onClick={async () => {
                      setSelectedGuest(guest);
                      setHistory([]);
                      setHistoryError(null);
                      setIsHistoryLoading(true);
                      try {
                        await fetchHistory(guest.id);
                      } catch (err) {
                        const message =
                          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
                          'Failed to load guest history.';
                        setHistoryError(String(message));
                      } finally {
                        setIsHistoryLoading(false);
                      }
                    }}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-forest-900">{guest.name}</div>
                          <div className="text-xs text-forest-700/60">ID: {guest.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-forest-700/80">
                          <Mail className="w-3.5 h-3.5" /> {guest.email}
                        </div>
                        <div className="flex items-center gap-2 text-forest-700/80">
                          <Phone className="w-3.5 h-3.5" /> {guest.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-forest-700/80">{guest.address}</td>
                    <td className="p-4 text-forest-700/80">
                      {new Date(guest.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedGuest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuest(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Guest Details</h2>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="p-2 hover:bg-earth-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <div className="text-sm text-forest-700/60">Guest ID</div>
                  <div className="text-forest-900 font-medium">{selectedGuest.id}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-forest-700/60">Full Name</div>
                    <div className="text-forest-900 font-medium">{selectedGuest.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-forest-700/60">Registered</div>
                    <div className="text-forest-900 font-medium">
                      {new Date(selectedGuest.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-forest-700/60">Email</div>
                    <div className="text-forest-900 font-medium">{selectedGuest.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-forest-700/60">Phone</div>
                    <div className="text-forest-900 font-medium">{selectedGuest.phone}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-forest-700/60">Address</div>
                  <div className="text-forest-900 font-medium">{selectedGuest.address}</div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-sm font-semibold text-forest-900">Check-in History</h3>
                    <button
                      onClick={async () => {
                        setIsHistoryLoading(true);
                        try {
                          await fetchHistory(selectedGuest.id);
                          showToast('History refreshed.', 'success');
                        } catch {
                          showToast('Failed to refresh history.', 'error');
                        } finally {
                          setIsHistoryLoading(false);
                        }
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-earth-200 hover:bg-earth-50 text-forest-800 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Refresh
                    </button>
                  </div>

                  {isHistoryLoading ? (
                    <div className="text-sm text-forest-700/70">Loading history...</div>
                  ) : historyError ? (
                    <div className="text-sm text-red-600">{historyError}</div>
                  ) : history.length === 0 ? (
                    <div className="text-sm text-forest-700/70">No reservations found for this guest.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-earth-100">
                      <table className="w-full">
                        <thead className="bg-earth-50">
                          <tr>
                            <th className="text-left p-3 text-xs font-medium text-forest-700 uppercase tracking-wider">
                              Reservation
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-forest-700 uppercase tracking-wider">
                              Room
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-forest-700 uppercase tracking-wider">
                              Check-in
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-forest-700 uppercase tracking-wider">
                              Check-out
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-forest-700 uppercase tracking-wider">
                              Nights
                            </th>
                            <th className="text-left p-3 text-xs font-medium text-forest-700 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-earth-100">
                          {history.map((r) => (
                            <tr key={r.id} className="hover:bg-earth-50/50">
                              <td className="p-3 text-sm text-forest-900">
                                RES-{String(r.id).padStart(4, '0')}
                              </td>
                              <td className="p-3 text-sm text-forest-900">
                                {r.room_number} ({r.room_type})
                              </td>
                              <td className="p-3 text-sm text-forest-700/80">
                                {new Date(r.check_in_date).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-sm text-forest-700/80">
                                {new Date(r.check_out_date).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-sm text-forest-700/80">{r.nights}</td>
                              <td className="p-3 text-sm text-forest-700/80">{r.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
