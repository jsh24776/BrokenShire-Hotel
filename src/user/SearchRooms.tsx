import { useState, useMemo } from 'react';
import { Search, Users, Calendar, Filter, Star, Wifi, Coffee, Wind, Tv, X, ChevronRight, ChevronLeft, Check, ShieldCheck, Home } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'motion/react';

const rooms = [
  {
    id: '101',
    name: 'Forest Suite',
    price: 12500,
    capacity: 2,
    size: '45 sqm',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in nature with our signature suite featuring floor-to-ceiling windows overlooking the ancient pines.',
    amenities: ['King Bed', 'Forest View', 'Balcony', 'Mini Bar'],
    available: true
  },
  {
    id: '201',
    name: 'Garden Villa',
    price: 18000,
    capacity: 4,
    size: '85 sqm',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'A peaceful haven with direct access to our botanical gardens. Perfect for families seeking a quiet getaway.',
    amenities: ['Queen Beds', 'Garden Access', 'Rain Shower', 'Private Pool'],
    available: true
  },
  {
    id: '301',
    name: 'Canopy Room',
    price: 8500,
    capacity: 2,
    size: '35 sqm',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    description: 'Elevated among the treetops with a private deck and stunning views of the forest canopy.',
    amenities: ['King Bed', 'Private Deck', 'Tree View'],
    available: true
  }
];

export default function SearchRooms() {
  const { showToast } = useToast();
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState('2');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [guestDetails, setGuestDetails] = useState({
    fullName: 'John Doe', // Mock pre-filled
    email: 'john.doe@example.com',
    phone: '+63 912 345 6789',
    specialRequests: ''
  });
  const [paymentMethod] = useState('PayPal'); // PayPal only for online
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const selectedRoom = useMemo(() => 
    rooms.find(r => r.id === selectedRoomId), 
    [selectedRoomId]
  );

  const pricing = useMemo(() => {
    if (!selectedRoom || !dates.checkIn || !dates.checkOut) return { total: 0, nights: 0 };
    
    const start = new Date(dates.checkIn);
    const end = new Date(dates.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    if (nights <= 0) return { total: 0, nights: 0 };
    
    const total = selectedRoom.price * nights;
    
    return {
      total,
      nights
    };
  }, [selectedRoom, dates]);

  const handleBookNow = (roomId: string) => {
    setSelectedRoomId(roomId);
    setBookingStep(1);
  };

  const handleConfirmBooking = async () => {
    if (!acceptedTerms) {
      showToast("Please accept the Terms & Conditions", "error");
      return;
    }
    setIsBooking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showToast(`Booking for ${selectedRoom?.name} confirmed!`, "success");
    setIsBooking(false);
    setSelectedRoomId(null);
    setBookingStep(1);
    setAcceptedTerms(false);
  };

  const handleSearch = () => {
    if (!dates.checkIn || !dates.checkOut) {
      showToast("Please select check-in and check-out dates", "error");
      return;
    }
    showToast("Searching for available rooms...", "info");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Find Your Retreat</h1>
        <p className="text-forest-700/70 mt-1">Discover the perfect room for your next nature getaway.</p>
      </div>

      {/* Search Bar */}
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
          <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40 pointer-events-none" />
        </div>
        <button 
          onClick={handleSearch}
          className="bg-forest-700 hover:bg-forest-800 text-white px-8 py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 md:w-auto w-full"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden group hover:shadow-md transition-all flex flex-col">
            <div className="relative h-56 overflow-hidden">
              <img 
                src={room.image} 
                alt={room.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              {!room.available && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                  <span className="bg-forest-900 text-white px-4 py-2 rounded-full font-medium text-sm">Sold Out</span>
                </div>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-serif font-semibold text-forest-900">{room.name}</h3>
                <div className="text-right">
                  <span className="text-lg font-semibold text-forest-900">₱{room.price.toLocaleString()}</span>
                  <span className="text-xs text-forest-700/70 block">/ night</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-forest-700/70 mb-4">
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {room.capacity}</span>
                <span className="flex items-center gap-1"><Search className="w-4 h-4" /> {room.size}</span>
              </div>
              
              <p className="text-sm text-forest-700/80 mb-6 line-clamp-2 flex-1">{room.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {room.amenities.slice(0, 3).map((amenity, i) => (
                  <span key={i} className="bg-earth-50 text-forest-800 text-xs px-2 py-1 rounded-md border border-earth-100">
                    {amenity}
                  </span>
                ))}
                {room.amenities.length > 3 && (
                  <span className="bg-earth-50 text-forest-800 text-xs px-2 py-1 rounded-md border border-earth-100">
                    +{room.amenities.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  className="flex-1 border border-forest-200 text-forest-800 hover:bg-forest-50 py-2.5 rounded-xl font-medium transition-colors text-sm"
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  View Details
                </button>
                <button 
                  disabled={!room.available}
                  onClick={() => handleBookNow(room.id)}
                  className="flex-1 bg-forest-700 hover:bg-forest-800 disabled:bg-earth-200 disabled:text-forest-800/40 text-white py-2.5 rounded-xl font-medium transition-colors text-sm"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Wizard Modal */}
      <AnimatePresence>
        {selectedRoomId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoomId(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-forest-900">Book Your Stay</h2>
                  <p className="text-sm text-forest-700/60">{selectedRoom?.name}</p>
                </div>
                <button 
                  onClick={() => setSelectedRoomId(null)}
                  className="p-2 hover:bg-earth-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex border-b border-earth-100">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div 
                    key={step}
                    className={`flex-1 h-1.5 transition-colors ${
                      step <= bookingStep ? 'bg-forest-600' : 'bg-earth-100'
                    }`}
                  />
                ))}
              </div>

              {/* Modal Content */}
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
                            <p className="text-lg font-bold text-forest-900">{selectedRoom?.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Room Type</p>
                            <p className="text-lg font-bold text-forest-900">{selectedRoom?.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-1">Rate per Night</p>
                            <p className="text-lg font-bold text-forest-900">₱{selectedRoom?.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-forest-600 mt-0.5" />
                        <p className="text-sm text-forest-800/80 leading-relaxed">
                          You have selected our premium {selectedRoom?.name}. Click next to provide your stay details.
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
                          <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Payment Method</p>
                          <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-forest-500 shadow-sm">
                            <div className="w-12 h-8 bg-[#003087] rounded flex items-center justify-center text-white font-bold italic text-xs">PayPal</div>
                            <div>
                              <p className="font-bold text-forest-900">PayPal</p>
                              <p className="text-[10px] text-forest-700/60">Secure online payment</p>
                            </div>
                            <div className="ml-auto">
                              <Check className="w-5 h-5 text-forest-600" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-earth-200 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-forest-700/70">Rate per Night</span>
                            <span className="font-medium text-forest-900">₱{selectedRoom?.price.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-forest-700/70">Number of Nights</span>
                            <span className="font-medium text-forest-900">{pricing.nights}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-earth-200">
                            <span className="font-bold text-forest-900">Total Amount</span>
                            <span className="text-3xl font-serif font-bold text-forest-900">₱{pricing.total.toLocaleString()}</span>
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
                            <p className="font-bold text-forest-900">{selectedRoom?.name}</p>
                            <p className="text-xs text-forest-700/60">Room {selectedRoom?.id}</p>
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
                              I agree to the <span className="underline font-medium">Terms & Conditions</span> and <span className="underline font-medium">Privacy Policy</span> of Brokenshire Hotel. I understand that my booking is subject to availability and hotel policies.
                            </span>
                          </label>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-earth-100 bg-earth-50/30 flex justify-between gap-4">
                {bookingStep > 1 ? (
                  <button 
                    onClick={() => setBookingStep(prev => prev - 1)}
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
                        showToast("Please select valid check-in and check-out dates", "error");
                        return;
                      }
                      setBookingStep(prev => prev + 1);
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
    </div>
  );
}
