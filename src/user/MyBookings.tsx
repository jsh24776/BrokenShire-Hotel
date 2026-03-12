import { useState } from 'react';
import { Calendar, Clock, MapPin, MoreVertical, XCircle, CheckCircle, X, Info, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const bookings = [
  {
    id: 'RES-49201',
    room: 'Forest Suite',
    checkIn: '2023-11-15',
    checkOut: '2023-11-18',
    status: 'Confirmed',
    amount: '$750.00',
    guests: 2,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'RES-38102',
    room: 'Garden Retreat',
    checkIn: '2023-08-10',
    checkOut: '2023-08-12',
    status: 'Checked-out',
    amount: '$360.00',
    guests: 2,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'RES-29011',
    room: 'Canopy Villa',
    checkIn: '2023-05-01',
    checkOut: '2023-05-05',
    status: 'Cancelled',
    amount: '$1800.00',
    guests: 4,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  }
];

export default function MyBookings() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    
    setIsCancelling(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast(`Booking ${id} has been cancelled.`, "success");
    setIsCancelling(false);
  };

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') return booking.status === 'Confirmed' || booking.status === 'Pending';
    if (activeTab === 'past') return booking.status === 'Checked-out';
    if (activeTab === 'cancelled') return booking.status === 'Cancelled';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Checked-out': return 'bg-slate-100 text-slate-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-earth-100 text-earth-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">My Bookings</h1>
        <p className="text-forest-700/70 mt-1">Manage your upcoming stays and view past reservations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-earth-200">
        <button 
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'upcoming' ? 'text-forest-900' : 'text-forest-700/50 hover:text-forest-700'}`}
        >
          Upcoming
          {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('past')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'past' ? 'text-forest-900' : 'text-forest-700/50 hover:text-forest-700'}`}
        >
          Past Stays
          {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'cancelled' ? 'text-forest-900' : 'text-forest-700/50 hover:text-forest-700'}`}
        >
          Cancelled
          {activeTab === 'cancelled' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-forest-700 rounded-t-full" />}
        </button>
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
              <div className="sm:w-48 h-48 sm:h-auto shrink-0">
                <img 
                  src={booking.image} 
                  alt={booking.room} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-serif font-semibold text-forest-900">{booking.room}</h3>
                      <p className="text-forest-700/70 text-sm">Reservation #{booking.id}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm mt-4">
                    <div className="flex items-center gap-2 text-forest-800">
                      <Calendar className="w-4 h-4 text-forest-700/50" />
                      <span>{booking.checkIn} to {booking.checkOut}</span>
                    </div>
                    <div className="flex items-center gap-2 text-forest-800">
                      <Clock className="w-4 h-4 text-forest-700/50" />
                      <span>2 Nights</span>
                    </div>
                    <div className="flex items-center gap-2 text-forest-800">
                      <MapPin className="w-4 h-4 text-forest-700/50" />
                      <span>{booking.guests} Guests</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-earth-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-forest-700/50">Total Amount</p>
                    <p className="font-semibold text-forest-900">{booking.amount}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    {booking.status === 'Confirmed' && (
                      <button 
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={isCancelling}
                        className="flex-1 sm:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedBookingId(booking.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-forest-50 text-forest-800 hover:bg-forest-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
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
      {/* Booking Details Modal */}
      <AnimatePresence>
        {selectedBookingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBookingId(null)}
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
                <button onClick={() => setSelectedBookingId(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  <img src={selectedBooking?.image} alt={selectedBooking?.room} className="w-24 h-24 rounded-2xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-forest-900">{selectedBooking?.room}</h3>
                    <p className="text-sm text-forest-700/60">Reservation #{selectedBooking?.id}</p>
                    <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking?.status || '')}`}>
                      {selectedBooking?.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-y border-earth-100">
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-in</p>
                    <p className="font-medium text-forest-900">{selectedBooking?.checkIn}</p>
                    <p className="text-xs text-forest-700/60">After 2:00 PM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-out</p>
                    <p className="font-medium text-forest-900">{selectedBooking?.checkOut}</p>
                    <p className="text-xs text-forest-700/60">Before 11:00 AM</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Guests</span>
                    <span className="font-medium text-forest-900">{selectedBooking?.guests} Adults</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Total Amount</span>
                    <span className="font-semibold text-forest-900">{selectedBooking?.amount}</span>
                  </div>
                </div>

                <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-forest-600 mt-0.5" />
                  <p className="text-xs text-forest-800/80 leading-relaxed">
                    This booking is protected by our Nature Retreat Guarantee. Need help? Contact our 24/7 concierge.
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
