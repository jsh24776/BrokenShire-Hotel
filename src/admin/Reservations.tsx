import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Trash2, CheckCircle, X, Calendar, Users, Home, CreditCard, DollarSign, Info, UserPlus, ArrowRight, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/ToastContext';
import { useNavigate } from 'react-router-dom';

const initialReservations = [
  { id: 'RES-001', guest: 'Sarah Jenkins', room: '101', type: 'Forest Suite', checkIn: '2023-10-25', checkOut: '2023-10-28', status: 'Confirmed', amount: '$750' },
  { id: 'RES-002', guest: 'Michael Chen', room: '204', type: 'Garden Retreat', checkIn: '2023-10-25', checkOut: '2023-10-27', status: 'Pending', amount: '$360' },
  { id: 'RES-003', guest: 'Emily Davis', room: '305', type: 'Canopy Villa', checkIn: '2023-10-26', checkOut: '2023-10-30', status: 'Confirmed', amount: '$1800' },
  { id: 'RES-004', guest: 'Robert Wilson', room: '102', type: 'Forest Suite', checkIn: '2023-10-22', checkOut: '2023-10-25', status: 'Checked Out', amount: '$750' },
  { id: 'RES-005', guest: 'Amanda Taylor', room: '205', type: 'Garden Retreat', checkIn: '2023-10-28', checkOut: '2023-11-02', status: 'Cancelled', amount: '$900' },
];

const ROOM_TYPES = [
  { id: 'forest', name: 'Forest Suite', rate: 250 },
  { id: 'garden', name: 'Garden Retreat', rate: 180 },
  { id: 'canopy', name: 'Canopy Villa', rate: 450 },
];

const EXISTING_GUESTS = [
  { id: 'G-101', name: 'Sarah Jenkins' },
  { id: 'G-102', name: 'Michael Chen' },
  { id: 'G-103', name: 'Emily Davis' },
  { id: 'G-104', name: 'Robert Wilson' },
  { id: 'G-105', name: 'Amanda Taylor' },
];

export default function Reservations() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState(initialReservations);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    guestSearch: '',
    selectedGuest: null as { id: string, name: string } | null,
    roomType: 'forest',
    roomNumber: '101',
    checkIn: '',
    checkOut: '',
    numGuests: 1,
    bookingSource: 'Walk-in',
    specialRequests: '',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending'
  });

  const [guestSearchResults, setGuestSearchResults] = useState<typeof EXISTING_GUESTS>([]);

  useEffect(() => {
    if (formData.guestSearch.length > 1) {
      const results = EXISTING_GUESTS.filter(g => 
        g.name.toLowerCase().includes(formData.guestSearch.toLowerCase()) || 
        g.id.toLowerCase().includes(formData.guestSearch.toLowerCase())
      );
      setGuestSearchResults(results);
    } else {
      setGuestSearchResults([]);
    }
  }, [formData.guestSearch]);

  const numNights = useMemo(() => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [formData.checkIn, formData.checkOut]);

  const totalAmount = useMemo(() => {
    const room = ROOM_TYPES.find(r => r.id === formData.roomType);
    return (room?.rate || 0) * numNights;
  }, [formData.roomType, numNights]);

  const handleNewBooking = async () => {
    if (!formData.selectedGuest) {
      showToast("Please select a guest first", "error");
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast("New booking created successfully!", "success");
    setIsSaving(false);
    setShowBookingModal(false);
    // Reset form
    setFormData({
      guestSearch: '',
      selectedGuest: null,
      roomType: 'forest',
      roomNumber: '101',
      checkIn: '',
      checkOut: '',
      numGuests: 1,
      bookingSource: 'Walk-in',
      specialRequests: '',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending'
    });
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
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Create New Booking</h2>
                <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              
              <div className="p-8 space-y-8 overflow-y-auto">
                {/* Guest Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Guest Information
                  </h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input 
                        type="text" 
                        placeholder="Search existing guest by name or ID..." 
                        value={formData.guestSearch}
                        onChange={(e) => setFormData({ ...formData, guestSearch: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                      />
                      {guestSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-earth-200 rounded-xl shadow-lg z-20 overflow-hidden">
                          {guestSearchResults.map(guest => (
                            <button
                              key={guest.id}
                              onClick={() => setFormData({ ...formData, selectedGuest: guest, guestSearch: guest.name, guestSearchResults: [] } as any)}
                              className="w-full text-left px-4 py-2 hover:bg-forest-50 transition-colors flex items-center justify-between"
                            >
                              <span className="font-medium text-forest-900">{guest.name}</span>
                              <span className="text-xs text-forest-700/50">{guest.id}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {formData.selectedGuest ? (
                      <div className="bg-forest-50 p-3 rounded-xl border border-forest-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-forest-200 text-forest-700 flex items-center justify-center font-bold text-xs">
                            {formData.selectedGuest.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-forest-900">{formData.selectedGuest.name}</p>
                            <p className="text-xs text-forest-700/60">{formData.selectedGuest.id}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setFormData({ ...formData, selectedGuest: null, guestSearch: '' })}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => navigate('/admin/guests')}
                        className="w-full py-2.5 border-2 border-dashed border-earth-200 rounded-xl text-forest-700/50 hover:border-forest-300 hover:text-forest-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <UserPlus className="w-4 h-4" />
                        New Guest? Create Profile First
                      </button>
                    )}
                  </div>
                </div>

                {/* Room Selection */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Room Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Room Type</label>
                      <select 
                        value={formData.roomType}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                      >
                        {ROOM_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.name} (${type.rate}/night)</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Room Number</label>
                      <input 
                        type="text" 
                        value={formData.roomNumber}
                        onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Check-in Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input 
                          type="date" 
                          value={formData.checkIn}
                          onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Check-out Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input 
                          type="date" 
                          value={formData.checkOut}
                          onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Number of Guests</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input 
                          type="number" 
                          min="1"
                          value={formData.numGuests}
                          onChange={(e) => setFormData({ ...formData, numGuests: parseInt(e.target.value) })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                        />
                      </div>
                    </div>
                    <div className="flex items-end pb-1">
                      <div className="bg-earth-50 px-4 py-2.5 rounded-xl border border-earth-100 w-full flex items-center justify-between">
                        <span className="text-xs text-forest-700/60">Duration:</span>
                        <span className="text-sm font-bold text-forest-900">{numNights} Nights</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Booking Source</label>
                      <select 
                        value={formData.bookingSource}
                        onChange={(e) => setFormData({ ...formData, bookingSource: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                      >
                        <option>Walk-in</option>
                        <option>Online</option>
                        <option>Phone</option>
                        <option>Travel Agency</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Special Requests</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Extra towels, Late check-in"
                        value={formData.specialRequests}
                        onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Information
                  </h3>
                  <div className="bg-forest-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                    <div className="relative z-10 flex justify-between items-end">
                      <div>
                        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Total Amount Due</p>
                        <h4 className="text-3xl font-bold">${totalAmount.toLocaleString()}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1">Calculated Rate</p>
                        <p className="text-sm font-medium">
                          {ROOM_TYPES.find(r => r.id === formData.roomType)?.name} × {numNights} nights
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Payment Method</label>
                      <select 
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                      >
                        <option>Cash</option>
                        <option>PayPal</option>
                        <option>Credit Card</option>
                        <option>Bank Transfer</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-forest-700 ml-1">Payment Status</label>
                      <select 
                        value={formData.paymentStatus}
                        onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Partially Paid</option>
                        <option>Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-earth-100 bg-earth-50/30">
                <button 
                  onClick={handleNewBooking}
                  disabled={isSaving}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-forest-900/10"
                >
                  {isSaving ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Create Reservation
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
