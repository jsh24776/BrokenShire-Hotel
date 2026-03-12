  import React, { useState, useMemo } from 'react';
  import { Search, Plus, Filter, Mail, Phone, MoreVertical, X, User, MapPin, CheckCircle, Calendar, CreditCard, History, Edit2, ShieldCheck, Clock } from 'lucide-react';
  import { motion, AnimatePresence } from 'motion/react';
  import { useToast } from '../components/ToastContext';

  const initialGuests = [
    { 
      id: 'G-1001', 
      name: 'Sarah Jenkins', 
      email: 'sarah.j@example.com', 
      phone: '+1 (555) 123-4567', 
      address: '456 Oak Lane, Seattle, WA',
      idType: 'Passport',
      idNumber: 'P12345678',
      regDate: '2023-01-15',
      totalStays: 3, 
      lastVisit: '2023-10-25', 
      status: 'In House' 
    },
    { 
      id: 'G-1002', 
      name: 'Michael Chen', 
      email: 'm.chen@example.com', 
      phone: '+1 (555) 987-6543', 
      address: '789 Pine St, San Francisco, CA',
      idType: 'Driver License',
      idNumber: 'DL-987654',
      regDate: '2023-05-20',
      totalStays: 1, 
      lastVisit: '2023-10-25', 
      status: 'Arriving' 
    },
    { 
      id: 'G-1003', 
      name: 'Emily Davis', 
      email: 'emily.d@example.com', 
      phone: '+1 (555) 456-7890', 
      address: '123 Maple Ave, Austin, TX',
      idType: 'National ID',
      idNumber: 'ID-456789',
      regDate: '2022-11-10',
      totalStays: 5, 
      lastVisit: '2023-08-12', 
      status: 'Inactive' 
    },
  ];

  const STAY_HISTORY = [
    { id: 'RES-001', guestId: 'G-1001', room: '101', type: 'Forest Suite', checkIn: '2023-10-25', checkOut: '2023-10-28', nights: 3, amount: '$750', paymentStatus: 'Paid', status: 'Confirmed' },
    { id: 'RES-008', guestId: 'G-1001', room: '202', type: 'Garden Retreat', checkIn: '2023-06-10', checkOut: '2023-06-12', nights: 2, amount: '$360', paymentStatus: 'Paid', status: 'Checked Out' },
    { id: 'RES-015', guestId: 'G-1001', room: '105', type: 'Forest Suite', checkIn: '2023-02-14', checkOut: '2023-02-16', nights: 2, amount: '$500', paymentStatus: 'Paid', status: 'Checked Out' },
  ];

  export default function Guests() {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [guests, setGuests] = useState(initialGuests);

    const filteredGuests = useMemo(() => {
      return guests.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.phone.includes(searchTerm) ||
        g.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [searchTerm, guests]);

    const handleSaveGuest = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast(isEditing ? "Guest profile updated successfully!" : "Guest profile created successfully!", "success");
      setIsSaving(false);
      setShowAddModal(false);
      setIsEditing(false);
      setSelectedGuest(null);
    };

    const handleEditClick = (guest: any) => {
      setSelectedGuest(guest);
      setIsEditing(true);
    };

    const handleViewClick = (guest: any) => {
      setSelectedGuest(guest);
      setIsEditing(false);
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'In House': return 'bg-emerald-100 text-emerald-800';
        case 'Arriving': return 'bg-blue-100 text-blue-800';
        case 'Departed': return 'bg-slate-100 text-slate-800';
        case 'Inactive': return 'bg-earth-100 text-earth-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-earth-100 text-earth-800';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-forest-900">Guest Directory</h1>
            <p className="text-forest-700/70 mt-1">Manage guest profiles and history.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Guest
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
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
                  <th className="p-4 font-medium">Guest</th>
                  <th className="p-4 font-medium">Contact</th>
                  <th className="p-4 font-medium">Total Stays</th>
                  <th className="p-4 font-medium">Last Visit</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-forest-900">
                {filteredGuests.map((guest) => (
                  <tr 
                    key={guest.id} 
                    onClick={() => handleViewClick(guest)}
                    className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-medium">
                          {guest.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{guest.name}</div>
                          <div className="text-xs text-forest-700/60">{guest.id}</div>
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
                    <td className="p-4">{guest.totalStays}</td>
                    <td className="p-4">{guest.lastVisit}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(guest)}
                          className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
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
        {/* Add/Edit/View Guest Modal */}
        <AnimatePresence>
          {(showAddModal || selectedGuest) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedGuest(null);
                  setIsEditing(false);
                }}
                className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                  <h2 className="text-xl font-serif font-semibold text-forest-900">
                    {showAddModal ? 'Add New Guest' : isEditing ? 'Edit Guest Profile' : 'Guest Profile Details'}
                  </h2>
                  <div className="flex items-center gap-2">
                    {!showAddModal && !isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-medium hover:bg-forest-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedGuest(null);
                        setIsEditing(false);
                      }} 
                      className="p-2 hover:bg-earth-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-forest-800/50" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                  {isEditing || showAddModal ? (
                    <form onSubmit={handleSaveGuest} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Basic Information
                          </h3>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-forest-800">Full Name</label>
                            <input 
                              type="text" 
                              defaultValue={selectedGuest?.name}
                              placeholder="John Doe" 
                              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-forest-800">Email Address</label>
                            <input 
                              type="email" 
                              defaultValue={selectedGuest?.email}
                              placeholder="john.doe@example.com" 
                              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-forest-800">Phone Number</label>
                            <input 
                              type="tel" 
                              defaultValue={selectedGuest?.phone}
                              placeholder="+1 (555) 000-0000" 
                              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Identification & Address
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-forest-800">ID Type</label>
                              <select 
                                defaultValue={selectedGuest?.idType || 'Passport'}
                                className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                              >
                                <option>Passport</option>
                                <option>Driver License</option>
                                <option>National ID</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-sm font-medium text-forest-800">ID Number</label>
                              <input 
                                type="text" 
                                defaultValue={selectedGuest?.idNumber}
                                placeholder="P12345678" 
                                className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" 
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-forest-800">Home Address</label>
                            <textarea 
                              defaultValue={selectedGuest?.address}
                              placeholder="123 Nature St, Forest City" 
                              rows={3}
                              className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none resize-none" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end gap-3">
                        <button 
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            setSelectedGuest(null);
                            setIsEditing(false);
                          }}
                          className="px-6 py-2.5 border border-earth-200 rounded-xl text-forest-800 font-medium hover:bg-earth-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="px-8 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              {isEditing ? 'Update Profile' : 'Create Profile'}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-10">
                      {/* Guest Profile Header */}
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-24 h-24 rounded-3xl bg-forest-100 text-forest-700 flex items-center justify-center text-3xl font-bold shadow-inner">
                          {selectedGuest.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="md:col-span-2">
                            <h3 className="text-2xl font-serif font-bold text-forest-900">{selectedGuest.name}</h3>
                            <p className="text-forest-700/60 flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-earth-100 rounded text-[10px] font-bold uppercase tracking-wider">{selectedGuest.id}</span>
                              • Registered on {selectedGuest.regDate}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-4">
                              <div className="flex items-center gap-2 text-sm text-forest-800">
                                <Mail className="w-4 h-4 text-forest-400" />
                                {selectedGuest.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-forest-800">
                                <Phone className="w-4 h-4 text-forest-400" />
                                {selectedGuest.phone}
                              </div>
                            </div>
                          </div>
                          <div className="bg-earth-50 p-4 rounded-2xl border border-earth-100">
                            <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest mb-2">Current Status</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedGuest.status)}`}>
                              {selectedGuest.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-forest-400" />
                            Home Address
                          </h4>
                          <p className="text-sm text-forest-800 leading-relaxed bg-earth-50/50 p-4 rounded-2xl border border-earth-100">
                            {selectedGuest.address}
                          </p>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-forest-400" />
                            Identification
                          </h4>
                          <div className="bg-earth-50/50 p-4 rounded-2xl border border-earth-100 grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-bold text-forest-700/40 uppercase mb-1">ID Type</p>
                              <p className="text-sm font-semibold text-forest-900">{selectedGuest.idType}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-forest-700/40 uppercase mb-1">ID Number</p>
                              <p className="text-sm font-semibold text-forest-900">{selectedGuest.idNumber}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stay History */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-forest-900 uppercase tracking-widest flex items-center gap-2">
                            <History className="w-4 h-4 text-forest-400" />
                            Stay History
                          </h4>
                          <span className="text-xs font-medium text-forest-700/50">{selectedGuest.totalStays} Total Reservations</span>
                        </div>
                        <div className="bg-white border border-earth-100 rounded-2xl overflow-hidden shadow-sm">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-earth-50 text-forest-800 border-b border-earth-100">
                                <th className="p-3 font-bold">Res. ID</th>
                                <th className="p-3 font-bold">Room</th>
                                <th className="p-3 font-bold">Dates</th>
                                <th className="p-3 font-bold">Nights</th>
                                <th className="p-3 font-bold">Amount</th>
                                <th className="p-3 font-bold">Payment</th>
                                <th className="p-3 font-bold">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-earth-50">
                              {STAY_HISTORY.filter(h => h.guestId === selectedGuest.id).map(history => (
                                <tr key={history.id} className="hover:bg-forest-50/30 transition-colors">
                                  <td className="p-3 font-medium text-forest-700">{history.id}</td>
                                  <td className="p-3">
                                    <div className="font-semibold">{history.room}</div>
                                    <div className="text-[10px] text-forest-700/50">{history.type}</div>
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-forest-300" />
                                      {history.checkIn} - {history.checkOut}
                                    </div>
                                  </td>
                                  <td className="p-3">{history.nights}</td>
                                  <td className="p-3 font-semibold">{history.amount}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${history.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                      {history.paymentStatus}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${history.status === 'Checked Out' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                      {history.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {STAY_HISTORY.filter(h => h.guestId === selectedGuest.id).length === 0 && (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-forest-700/40 italic">
                                    No past reservations found for this guest.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
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
