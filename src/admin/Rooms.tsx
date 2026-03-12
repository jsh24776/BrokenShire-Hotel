import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, X, CheckCircle, Home, Users, Wifi, Tv, Wind, Coffee, Waves, Eye, Zap, Utensils, Bath, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

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

const initialRooms = [
  { 
    id: '101', 
    type: 'Forest Suite', 
    floor: '1', 
    capacity: 2, 
    status: 'Occupied', 
    rate: '₱12,500', 
    housekeeping: 'Clean',
    dateAdded: '2023-01-10',
    amenities: ['ac', 'wifi', 'tv', 'forest_view', 'mini_bar', 'coffee_maker']
  },
  { 
    id: '102', 
    type: 'Forest Suite', 
    floor: '1', 
    capacity: 2, 
    status: 'Vacant', 
    rate: '₱12,500', 
    housekeeping: 'Dirty',
    dateAdded: '2023-01-10',
    amenities: ['ac', 'wifi', 'tv', 'forest_view', 'mini_bar']
  },
  { 
    id: '201', 
    type: 'Garden Villa', 
    floor: '2', 
    capacity: 4, 
    status: 'Vacant', 
    rate: '₱18,000', 
    housekeeping: 'Clean',
    dateAdded: '2023-02-15',
    amenities: ['ac', 'wifi', 'tv', 'garden_view', 'mini_bar', 'kitchen', 'private_pool']
  },
  { 
    id: '202', 
    type: 'Garden Villa', 
    floor: '2', 
    capacity: 4, 
    status: 'Reserved', 
    rate: '₱18,000', 
    housekeeping: 'Clean',
    dateAdded: '2023-02-15',
    amenities: ['ac', 'wifi', 'tv', 'garden_view', 'mini_bar', 'kitchen']
  },
  { 
    id: '301', 
    type: 'Canopy Room', 
    floor: '3', 
    capacity: 2, 
    status: 'Occupied', 
    rate: '₱8,500', 
    housekeeping: 'Clean',
    dateAdded: '2023-03-20',
    amenities: ['ac', 'wifi', 'tv', 'tree_view', 'coffee_maker']
  },
  { 
    id: '302', 
    type: 'Standard', 
    floor: '3', 
    capacity: 2, 
    status: 'Out of Service', 
    rate: '₱4,500', 
    housekeeping: 'Maintenance',
    dateAdded: '2023-03-20',
    amenities: ['ac', 'wifi', 'tv']
  },
];

const ROOM_STATUSES = ['Vacant', 'Reserved', 'Occupied', 'Dirty', 'Ready', 'Out of Service'];

export default function Rooms() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState(initialRooms);

  const handleAddRoom = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast("Room added successfully!", "success");
    setIsSaving(false);
    setShowAddModal(false);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast("Room configuration updated successfully!", "success");
    setIsSaving(false);
    setSelectedRoom(null);
    setIsEditing(false);
  };

  const handleArchiveRoom = (id: string) => {
    // Simulated check for active reservations
    const hasActiveReservations = id === '101' || id === '301'; // Mocking active reservations for these rooms
    
    if (hasActiveReservations) {
      showToast(`Cannot archive Room ${id}: Active reservations found.`, "error");
    } else {
      showToast(`Room ${id} has been archived successfully.`, "success");
      setRooms(rooms.filter(r => r.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`Room ${id} status updated to ${newStatus}`, "success");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant':
      case 'Ready': return 'bg-emerald-100 text-emerald-800';
      case 'Occupied': return 'bg-blue-100 text-blue-800';
      case 'Reserved': return 'bg-amber-100 text-amber-800';
      case 'Dirty': return 'bg-orange-100 text-orange-800';
      case 'Out of Service': return 'bg-red-100 text-red-800';
      default: return 'bg-earth-100 text-earth-800';
    }
  };

  const getHousekeepingColor = (status: string) => {
    switch (status) {
      case 'Clean':
      case 'Ready': return 'text-emerald-600';
      case 'Dirty': return 'text-amber-600';
      case 'Maintenance': return 'text-red-600';
      default: return 'text-forest-600';
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.id.includes(searchTerm) || 
    r.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Room Inventory</h1>
          <p className="text-forest-700/70 mt-1">Manage room statuses, rates, and housekeeping.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {/* Filters and Search */}
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
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-earth-200 rounded-xl text-forest-800 hover:bg-earth-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
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
                  key={room.id} 
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsEditing(false);
                  }}
                  className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none cursor-pointer"
                >
                  <td className="p-4 font-medium text-forest-900">{room.id}</td>
                  <td className="p-4">{room.type}</td>
                  <td className="p-4">{room.floor}</td>
                  <td className="p-4">{room.capacity} Pax</td>
                  <td className="p-4">{room.rate}</td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={room.status}
                      onChange={(e) => handleStatusChange(room.id, e.target.value)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border-none outline-none cursor-pointer ${getStatusColor(room.status)}`}
                    >
                      {ROOM_STATUSES.map(status => (
                        <option key={status} value={status} className="bg-white text-forest-900">{status}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getHousekeepingColor(room.housekeeping)}`}>
                      {room.housekeeping}
                    </span>
                  </td>
                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedRoom(room);
                          setIsEditing(true);
                        }}
                        className="p-1.5 text-earth-600 hover:bg-earth-50 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleArchiveRoom(room.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Archive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-forest-800 hover:bg-forest-50 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add / Edit / View Room Modal */}
      <AnimatePresence>
        {(showAddModal || selectedRoom) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setSelectedRoom(null);
                setIsEditing(false);
              }}
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
                  {showAddModal ? 'Add New Room' : isEditing ? 'Edit Room Configuration' : 'Room Details'}
                </h2>
                <div className="flex items-center gap-2">
                  {!showAddModal && !isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-medium hover:bg-forest-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Room
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedRoom(null);
                      setIsEditing(false);
                    }} 
                    className="p-2 hover:bg-earth-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-forest-800/50" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto">
                {isEditing || showAddModal ? (
                  <form onSubmit={handleSaveRoom} className="space-y-8">
                    {/* Basic Information */}
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
                            disabled={!showAddModal}
                            defaultValue={selectedRoom?.id}
                            placeholder="e.g. 101" 
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none disabled:bg-earth-50 disabled:text-forest-400" 
                          />
                          {!showAddModal && <p className="text-[10px] text-amber-600 mt-1 font-medium">⚠️ Room number cannot be changed after creation.</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Room Type</label>
                          <select 
                            defaultValue={selectedRoom?.type || 'Forest Suite'}
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
                          <label className="text-sm font-medium text-forest-800">Floor Number</label>
                          <input 
                            type="number" 
                            defaultValue={selectedRoom?.floor}
                            placeholder="e.g. 1" 
                            className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-forest-800">Capacity (Persons)</label>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                            <input 
                              type="number" 
                              defaultValue={selectedRoom?.capacity}
                              placeholder="2" 
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <span className="text-lg">₱</span>
                        Pricing
                      </h3>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-forest-800">Rate per Night (₱)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-forest-400 font-medium">₱</span>
                          <input 
                            type="text" 
                            defaultValue={selectedRoom?.rate?.replace('₱', '').replace(',', '')}
                            placeholder="5000" 
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Amenities
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {AMENITIES_LIST.map((amenity) => (
                          <label key={amenity.id} className="flex items-center gap-3 p-3 rounded-xl border border-earth-100 hover:bg-forest-50 cursor-pointer transition-colors group">
                            <input 
                              type="checkbox" 
                              defaultChecked={selectedRoom?.amenities?.includes(amenity.id)}
                              className="w-4 h-4 rounded border-earth-300 text-forest-600 focus:ring-forest-500" 
                            />
                            <div className="flex items-center gap-2">
                              <amenity.icon className="w-3.5 h-3.5 text-forest-400 group-hover:text-forest-600 transition-colors" />
                              <span className="text-xs font-medium text-forest-700">{amenity.label}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setSelectedRoom(null);
                          setIsEditing(false);
                        }}
                        className="px-6 py-2.5 border border-earth-200 rounded-xl text-forest-800 font-medium hover:bg-earth-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-forest-900/10"
                      >
                        {isSaving ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            {showAddModal ? 'Save Room Configuration' : 'Update Room Configuration'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-10">
                    {/* Room Detail Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      <div className="w-24 h-24 rounded-3xl bg-forest-900 text-white flex flex-col items-center justify-center shadow-xl">
                        <span className="text-xs uppercase tracking-widest opacity-60">Room</span>
                        <span className="text-3xl font-bold">{selectedRoom.id}</span>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <h3 className="text-2xl font-serif font-bold text-forest-900">{selectedRoom.type}</h3>
                          <p className="text-forest-700/60 flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-earth-100 rounded text-[10px] font-bold uppercase tracking-wider">Floor {selectedRoom.floor}</span>
                            • Added on {selectedRoom.dateAdded}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-6">
                            <div className="flex items-center gap-2 text-sm text-forest-800">
                              <Users className="w-4 h-4 text-forest-400" />
                              Capacity: {selectedRoom.capacity} Pax
                            </div>
                            <div className="flex items-center gap-2 text-sm text-forest-800">
                              <span className="text-lg font-bold text-forest-700">₱</span>
                              Rate: {selectedRoom.rate} / night
                            </div>
                          </div>
                        </div>
                        <div className="bg-earth-50 p-4 rounded-2xl border border-earth-100">
                          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-2">Current Status</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedRoom.status)}`}>
                            {selectedRoom.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amenities Checklist */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                        <Plus className="w-4 h-4 text-forest-400" />
                        Room Amenities
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {AMENITIES_LIST.map((amenity) => {
                          const isIncluded = selectedRoom.amenities.includes(amenity.id);
                          return (
                            <div 
                              key={amenity.id} 
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isIncluded ? 'bg-forest-50 border-forest-100' : 'bg-white border-earth-50 opacity-40'}`}
                            >
                              <amenity.icon className={`w-4 h-4 ${isIncluded ? 'text-forest-600' : 'text-forest-300'}`} />
                              <span className={`text-xs font-medium ${isIncluded ? 'text-forest-900' : 'text-forest-400'}`}>{amenity.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Status Update */}
                    <div className="bg-earth-50 p-6 rounded-3xl border border-earth-100">
                      <h4 className="text-xs font-bold text-forest-900 uppercase tracking-widest mb-4">Quick Status Update</h4>
                      <div className="flex flex-wrap gap-2">
                        {ROOM_STATUSES.map(status => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(selectedRoom.id, status)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRoom.status === status ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-forest-500' : 'bg-white text-forest-700 hover:bg-earth-100'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
