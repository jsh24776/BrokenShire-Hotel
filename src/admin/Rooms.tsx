import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, X, CheckCircle, Home, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

const initialRooms = [
  { id: '101', type: 'Forest Suite', floor: '1st Floor', status: 'Occupied', rate: '$250', housekeeping: 'Clean' },
  { id: '102', type: 'Forest Suite', floor: '1st Floor', status: 'Vacant', rate: '$250', housekeeping: 'Dirty' },
  { id: '201', type: 'Garden Retreat', floor: '2nd Floor', status: 'Vacant', rate: '$180', housekeeping: 'Clean' },
  { id: '202', type: 'Garden Retreat', floor: '2nd Floor', status: 'Reserved', rate: '$180', housekeeping: 'Clean' },
  { id: '301', type: 'Canopy Villa', floor: '3rd Floor', status: 'Occupied', rate: '$450', housekeeping: 'Clean' },
  { id: '302', type: 'Canopy Villa', floor: '3rd Floor', status: 'Out of Service', rate: '$450', housekeeping: 'Maintenance' },
];

export default function Rooms() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddRoom = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    showToast("Room added successfully!", "success");
    setIsSaving(false);
    setShowAddModal(false);
  };

  const handleArchiveRoom = (id: string) => {
    showToast(`Room ${id} archived`, "info");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant': return 'bg-emerald-100 text-emerald-800';
      case 'Occupied': return 'bg-blue-100 text-blue-800';
      case 'Reserved': return 'bg-amber-100 text-amber-800';
      case 'Out of Service': return 'bg-red-100 text-red-800';
      default: return 'bg-earth-100 text-earth-800';
    }
  };

  const getHousekeepingColor = (status: string) => {
    switch (status) {
      case 'Clean': return 'text-emerald-600';
      case 'Dirty': return 'text-amber-600';
      case 'Maintenance': return 'text-red-600';
      default: return 'text-forest-600';
    }
  };

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
                <th className="p-4 font-medium">Base Rate</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Housekeeping</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-forest-900">
              {initialRooms.map((room) => (
                <tr key={room.id} className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none">
                  <td className="p-4 font-medium text-forest-900">{room.id}</td>
                  <td className="p-4">{room.type}</td>
                  <td className="p-4">{room.floor}</td>
                  <td className="p-4">{room.rate}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getHousekeepingColor(room.housekeeping)}`}>
                      {room.housekeeping}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-earth-600 hover:bg-earth-50 rounded-lg transition-colors" title="Edit">
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
      {/* Add Room Modal Simulation */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Add New Room</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Room Number</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input type="text" placeholder="e.g. 401" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Floor</label>
                      <select className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none appearance-none">
                        <option>1st Floor</option>
                        <option>2nd Floor</option>
                        <option>3rd Floor</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Room Type</label>
                    <select className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none appearance-none">
                      <option>Forest Suite</option>
                      <option>Garden Retreat</option>
                      <option>Canopy Villa</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Base Rate ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input type="number" placeholder="250" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddRoom}
                  disabled={isSaving}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Room Configuration
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
