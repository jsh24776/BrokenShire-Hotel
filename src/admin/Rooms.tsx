import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  Archive,
  Bath,
  Coffee,
  Droplets,
  Edit,
  Eye,
  Filter,
  Home,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Tv,
  Users,
  Wifi,
  Wind,
  X,
  Zap,
  Utensils,
  ArchiveRestore,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

const AMENITIES_LIST = [
  { id: 'ac', label: 'AC', icon: Wind },
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'forest_view', label: 'Forest View', icon: Eye },
  { id: 'garden_view', label: 'Garden View', icon: Eye },
  { id: 'tree_view', label: 'Tree View', icon: Eye },
  { id: 'mini_bar', label: 'Mini Bar', icon: Zap },
  { id: 'jacuzzi', label: 'Jacuzzi', icon: Bath },
  { id: 'kitchen', label: 'Kitchen', icon: Utensils },
  { id: 'outdoor_bath', label: 'Outdoor Bath', icon: Bath },
  { id: 'private_pool', label: 'Private Pool', icon: Droplets },
  { id: 'coffee_maker', label: 'Coffee Maker', icon: Coffee },
];

const ROOM_STATUSES = ['Vacant', 'Reserved', 'Occupied', 'Dirty', 'Ready', 'Out of Service'];
const HOUSEKEEPING_STATUSES = ['Clean', 'Dirty', 'Ready', 'Maintenance'];

type Room = {
  room_number: string;
  type: string;
  floor: number;
  capacity: number;
  base_rate_cents: number;
  currency: string;
  status: string;
  housekeeping_status: string;
  amenities: string[];
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type ModalMode = 'add' | 'edit' | 'view';

function formatMoney(cents: number, currency: string) {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(value);
  } catch {
    return `₱${value.toLocaleString()}`;
  }
}

export default function Rooms() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [roomToArchive, setRoomToArchive] = useState<Room | null>(null);

  const [form, setForm] = useState({
    room_number: '',
    type: 'Forest Suite',
    floor: 1,
    capacity: 2,
    rate_pesos: 12500,
    status: 'Vacant',
    housekeeping_status: 'Clean',
    amenities: new Set<string>(),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant':
      case 'Ready':
        return 'bg-emerald-100 text-emerald-800';
      case 'Occupied':
        return 'bg-blue-100 text-blue-800';
      case 'Reserved':
        return 'bg-amber-100 text-amber-800';
      case 'Dirty':
        return 'bg-orange-100 text-orange-800';
      case 'Out of Service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-earth-100 text-earth-800';
    }
  };

  const getHousekeepingColor = (status: string) => {
    switch (status) {
      case 'Clean':
      case 'Ready':
        return 'text-emerald-600';
      case 'Dirty':
        return 'text-amber-600';
      case 'Maintenance':
        return 'text-red-600';
      default:
        return 'text-forest-600';
    }
  };

  const fetchRooms = async (signal?: AbortSignal) => {
    setError(null);
    const res = await api.get('/admin/rooms', {
      params: {
        search: searchTerm,
        per_page: 100,
        include_archived: includeArchived ? 1 : 0,
      },
      signal,
    });

    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    setRooms(data);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        await fetchRooms(controller.signal);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load rooms.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [searchTerm, includeArchived]);

  const filteredRooms = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return rooms;
    return rooms.filter((r) =>
      [r.room_number, r.type].some((v) => v.toLowerCase().includes(s))
    );
  }, [rooms, searchTerm]);

  const openAdd = () => {
    setModalMode('add');
    setSelectedRoom(null);
    setForm({
      room_number: '',
      type: 'Forest Suite',
      floor: 1,
      capacity: 2,
      rate_pesos: 12500,
      status: 'Vacant',
      housekeeping_status: 'Clean',
      amenities: new Set<string>(['ac', 'wifi', 'tv']),
    });
    setShowModal(true);
  };

  const openView = (room: Room) => {
    setModalMode('view');
    setSelectedRoom(room);
    setShowModal(true);
  };

  const openEdit = (room: Room) => {
    setModalMode('edit');
    setSelectedRoom(room);
    setForm({
      room_number: room.room_number,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      rate_pesos: Math.round((room.base_rate_cents ?? 0) / 100),
      status: room.status,
      housekeeping_status: room.housekeeping_status,
      amenities: new Set<string>(room.amenities ?? []),
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  const submitRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        room_number: form.room_number,
        type: form.type,
        floor: Number(form.floor),
        capacity: Number(form.capacity),
        base_rate_cents: Math.max(0, Math.round(Number(form.rate_pesos) * 100)),
        currency: 'PHP',
        status: form.status,
        housekeeping_status: form.housekeeping_status,
        amenities: Array.from(form.amenities),
      };

      if (modalMode === 'add') {
        await api.post('/admin/rooms', payload);
        showToast('Room added successfully!', 'success');
      } else if (modalMode === 'edit' && selectedRoom) {
        await api.put(`/admin/rooms/${selectedRoom.room_number}`, payload);
        showToast('Room updated successfully!', 'success');
      }

      await fetchRooms();
      closeModal();
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Failed to save room.';
      showToast(String(message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const archiveRoom = async (room: Room) => {
    try {
      await api.patch(`/admin/rooms/${room.room_number}/archive`);
      showToast(`Room ${room.room_number} archived.`, 'success');
      await fetchRooms();
      if (selectedRoom?.room_number === room.room_number) {
        closeModal();
      }
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        `Failed to archive Room ${room.room_number}.`;
      showToast(String(message), 'error');
    }
  };

  const requestArchive = (room: Room) => {
    setRoomToArchive(room);
  };

  const unarchiveRoom = async (room: Room) => {
    try {
      await api.patch(`/admin/rooms/${room.room_number}/unarchive`);
      showToast(`Room ${room.room_number} restored.`, 'success');
      await fetchRooms();
    } catch {
      showToast('Failed to restore room.', 'error');
    }
  };

  const updateStatus = async (room: Room, status: string) => {
    try {
      await api.put(`/admin/rooms/${room.room_number}`, { status });
      setRooms((prev) => prev.map((r) => (r.room_number === room.room_number ? { ...r, status } : r)));
      showToast(`Room ${room.room_number} status updated.`, 'success');
    } catch {
      showToast('Failed to update status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Room Inventory</h1>
          <p className="text-forest-700/70 mt-1">Manage rooms from the database.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
          <input
            type="text"
            placeholder="Search by room number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-earth-200 rounded-xl text-forest-800 hover:bg-earth-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <label className="flex items-center gap-2 text-sm text-forest-800">
            <input
              type="checkbox"
              checked={includeArchived}
              onChange={(e) => setIncludeArchived(e.target.checked)}
              className="rounded border-earth-300"
            />
            Show archived
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-forest-700/70">Loading rooms...</div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">{error}</div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-10 text-center text-forest-700/70">No rooms found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-earth-50 text-forest-800 text-sm border-b border-earth-200">
                  <th className="p-4 font-medium">Room Number</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Floor</th>
                  <th className="p-4 font-medium">Capacity</th>
                  <th className="p-4 font-medium">Base Rate</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Housekeeping</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-forest-900">
                {filteredRooms.map((room) => (
                  <tr
                    key={room.room_number}
                    onClick={() => openView(room)}
                    className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none cursor-pointer"
                  >
                    <td className="p-4 font-medium text-forest-900">{room.room_number}</td>
                    <td className="p-4">{room.type}</td>
                    <td className="p-4">{room.floor}</td>
                    <td className="p-4">{room.capacity} Pax</td>
                    <td className="p-4">{formatMoney(room.base_rate_cents, room.currency)}</td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={room.status}
                        onChange={(e) => updateStatus(room, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${getStatusColor(room.status)}`}
                      >
                        {ROOM_STATUSES.map((status) => (
                          <option key={status} value={status} className="bg-white text-forest-900">
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getHousekeepingColor(room.housekeeping_status)}`}>
                        {room.housekeeping_status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(room)}
                          className="p-1.5 text-earth-600 hover:bg-earth-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {room.archived_at ? (
                          <button
                            onClick={() => unarchiveRoom(room)}
                            className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors"
                            title="Restore"
                          >
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => requestArchive(room)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}

                        <button className="p-1.5 text-forest-800 hover:bg-forest-50 rounded-lg transition-colors" title="More">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
              className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">
                  {modalMode === 'add' ? 'Add New Room' : modalMode === 'edit' ? 'Edit Room' : 'Room Details'}
                </h2>
                <div className="flex items-center gap-2">
                  {modalMode === 'view' && selectedRoom && (
                    <button
                      onClick={() => openEdit(selectedRoom)}
                      className="flex items-center gap-2 px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-medium hover:bg-forest-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Room
                    </button>
                  )}
                  <button onClick={closeModal} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-forest-800/50" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto">
                {modalMode === 'view' && selectedRoom ? (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-24 h-24 rounded-3xl bg-forest-900 text-white flex flex-col items-center justify-center shadow-xl">
                        <span className="text-xs uppercase tracking-widest opacity-60">Room</span>
                        <span className="text-3xl font-bold">{selectedRoom.room_number}</span>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <h3 className="text-2xl font-serif font-bold text-forest-900">{selectedRoom.type}</h3>
                          <p className="text-forest-700/60 flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-earth-100 rounded text-[10px] font-bold uppercase tracking-wider">
                              Floor {selectedRoom.floor}
                            </span>
                            • Added on {new Date(selectedRoom.created_at).toLocaleDateString()}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-6">
                            <div className="flex items-center gap-2 text-sm text-forest-800">
                              <Users className="w-4 h-4 text-forest-400" />
                              Capacity: {selectedRoom.capacity} Pax
                            </div>
                            <div className="flex items-center gap-2 text-sm text-forest-800">
                              <span className="text-lg font-bold text-forest-700">₱</span>
                              Rate: {formatMoney(selectedRoom.base_rate_cents, selectedRoom.currency)} / night
                            </div>
                          </div>
                        </div>

                        <div className="bg-earth-50 p-4 rounded-2xl border border-earth-100">
                          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-2">
                            Current Status
                          </p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                              selectedRoom.status
                            )}`}
                          >
                            {selectedRoom.status}
                          </span>
                          {selectedRoom.archived_at && (
                            <div className="mt-2 text-xs text-red-700/70">Archived</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <Plus className="w-4 h-4 text-forest-400" />
                        Room Amenities
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {AMENITIES_LIST.map((amenity) => {
                          const isIncluded = (selectedRoom.amenities ?? []).includes(amenity.id);
                          return (
                            <div
                              key={amenity.id}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                isIncluded
                                  ? 'bg-forest-50 border-forest-100'
                                  : 'bg-white border-earth-50 opacity-40'
                              }`}
                            >
                              <amenity.icon
                                className={`w-4 h-4 ${isIncluded ? 'text-forest-600' : 'text-forest-300'}`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  isIncluded ? 'text-forest-900' : 'text-forest-400'
                                }`}
                              >
                                {amenity.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {selectedRoom.archived_at ? (
                        <button
                          onClick={() => unarchiveRoom(selectedRoom)}
                          className="px-4 py-2 rounded-xl bg-forest-700 text-white text-sm font-medium hover:bg-forest-800 transition-colors"
                        >
                          Restore Room
                        </button>
                      ) : (
                        <button
                          onClick={() => requestArchive(selectedRoom)}
                          className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
                        >
                          Archive Room
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submitRoom} className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Basic Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Room Number</label>
                          <input
                            type="text"
                            disabled={modalMode !== 'add'}
                            value={form.room_number}
                            onChange={(e) => setForm((p) => ({ ...p, room_number: e.target.value }))}
                            placeholder="e.g. 101"
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none disabled:bg-earth-50 disabled:text-forest-400"
                          />
                          {modalMode !== 'add' && (
                            <p className="text-[10px] text-amber-600 mt-1 font-medium">
                              ⚠️ Room number cannot be changed after creation.
                            </p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Room Type</label>
                          <select
                            value={form.type}
                            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                          >
                            <option>Forest Suite</option>
                            <option>Garden Villa</option>
                            <option>Canopy Room</option>
                            <option>Standard</option>
                            <option>Deluxe</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Floor</label>
                          <input
                            type="number"
                            min={0}
                            value={form.floor}
                            onChange={(e) => setForm((p) => ({ ...p, floor: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Capacity</label>
                          <input
                            type="number"
                            min={1}
                            value={form.capacity}
                            onChange={(e) => setForm((p) => ({ ...p, capacity: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Base Rate (PHP)</label>
                          <input
                            type="number"
                            min={0}
                            value={form.rate_pesos}
                            onChange={(e) => setForm((p) => ({ ...p, rate_pesos: Number(e.target.value) }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Status</label>
                          <select
                            value={form.status}
                            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                          >
                            {ROOM_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-forest-800">Housekeeping</label>
                          <select
                            value={form.housekeeping_status}
                            onChange={(e) => setForm((p) => ({ ...p, housekeeping_status: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                          >
                            {HOUSEKEEPING_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Amenities
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {AMENITIES_LIST.map((a) => {
                          const included = form.amenities.has(a.id);
                          return (
                            <button
                              type="button"
                              key={a.id}
                              onClick={() => {
                                setForm((p) => {
                                  const next = new Set(p.amenities);
                                  if (next.has(a.id)) next.delete(a.id);
                                  else next.add(a.id);
                                  return { ...p, amenities: next };
                                });
                              }}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                included
                                  ? 'bg-forest-50 border-forest-100'
                                  : 'bg-white border-earth-100 hover:bg-earth-50'
                              }`}
                            >
                              <a.icon className={`w-4 h-4 ${included ? 'text-forest-600' : 'text-forest-300'}`} />
                              <span className={`text-xs font-medium ${included ? 'text-forest-900' : 'text-forest-600'}`}>
                                {a.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
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
                        {isSaving ? 'Saving...' : modalMode === 'add' ? 'Create Room' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {roomToArchive && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRoomToArchive(null)}
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
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-forest-900">Confirm Archive</div>
                    <div className="text-xs text-forest-700/60">Room {roomToArchive.room_number}</div>
                  </div>
                </div>
                <button
                  onClick={() => setRoomToArchive(null)}
                  className="p-2 hover:bg-earth-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-forest-800">Do you really want to archive this room?</p>
                <p className="text-xs text-forest-700/60 mt-2">
                  Archived rooms will be hidden from the default list. You can restore them later.
                </p>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setRoomToArchive(null)}
                    className="px-4 py-2 rounded-xl border border-earth-200 hover:bg-earth-50 text-forest-800"
                  >
                    No
                  </button>
                  <button
                    onClick={async () => {
                      const room = roomToArchive;
                      setRoomToArchive(null);
                      await archiveRoom(room);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium"
                  >
                    Yes, archive
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
