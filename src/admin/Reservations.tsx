import { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, CheckCircle, X, Calendar, Users, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

const initialReservations = [
  { id: 'RES-001', guest: 'Sarah Jenkins', room: '101', type: 'Forest Suite', checkIn: '2023-10-25', checkOut: '2023-10-28', status: 'Confirmed', amount: '$750' },
  { id: 'RES-002', guest: 'Michael Chen', room: '204', type: 'Garden Retreat', checkIn: '2023-10-25', checkOut: '2023-10-27', status: 'Pending', amount: '$360' },
  { id: 'RES-003', guest: 'Emily Davis', room: '305', type: 'Canopy Villa', checkIn: '2023-10-26', checkOut: '2023-10-30', status: 'Confirmed', amount: '$1800' },
  { id: 'RES-004', guest: 'Robert Wilson', room: '102', type: 'Forest Suite', checkIn: '2023-10-22', checkOut: '2023-10-25', status: 'Checked Out', amount: '$750' },
  { id: 'RES-005', guest: 'Amanda Taylor', room: '205', type: 'Garden Retreat', checkIn: '2023-10-28', checkOut: '2023-11-02', status: 'Cancelled', amount: '$900' },
];

export default function Reservations() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState(initialReservations);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleNewBooking = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast("New booking created successfully!", "success");
    setIsSaving(false);
    setShowBookingModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Checked Out': return 'bg-slate-100 text-slate-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-earth-100 text-earth-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Reservations</h1>
          <p className="text-forest-700/70 mt-1">Manage all bookings and room assignments.</p>
        </div>
        <button 
          onClick={() => setShowBookingModal(true)}
          className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
          <input
            type="text"
            placeholder="Search guests or reservation ID..."
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
                <th className="p-4 font-medium">ID</th>
                <th className="p-4 font-medium">Guest Name</th>
                <th className="p-4 font-medium">Room</th>
                <th className="p-4 font-medium">Check-in / Out</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-forest-900">
              {reservations.map((res) => (
                <tr key={res.id} className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none">
                  <td className="p-4 font-medium text-forest-700">{res.id}</td>
                  <td className="p-4">{res.guest}</td>
                  <td className="p-4">
                    <div>{res.room}</div>
                    <div className="text-xs text-forest-700/60">{res.type}</div>
                  </td>
                  <td className="p-4">
                    <div>{res.checkIn}</div>
                    <div className="text-xs text-forest-700/60">to {res.checkOut}</div>
                  </td>
                  <td className="p-4">{res.amount}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors" title="Confirm">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-earth-600 hover:bg-earth-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Cancel">
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
        
        {/* Pagination */}
        <div className="p-4 border-t border-earth-100 flex items-center justify-between text-sm text-forest-700/70">
          <span>Showing 1 to 5 of 24 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-earth-200 rounded-lg hover:bg-earth-50 disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 bg-forest-700 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-earth-200 rounded-lg hover:bg-earth-50">2</button>
            <button className="px-3 py-1 border border-earth-200 rounded-lg hover:bg-earth-50">3</button>
            <button className="px-3 py-1 border border-earth-200 rounded-lg hover:bg-earth-50">Next</button>
          </div>
        </div>
      </div>
      {/* New Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBookingModal(false)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Create New Booking</h2>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Guest Name</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input type="text" placeholder="Search or enter guest name" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input type="date" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input type="date" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Room Type</label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none appearance-none">
                        <option>Forest Suite</option>
                        <option>Garden Retreat</option>
                        <option>Canopy Villa</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleNewBooking}
                  disabled={isSaving}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Reservation
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
