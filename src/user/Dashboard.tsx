import { CalendarDays, CreditCard, MapPin, Search, ArrowRight, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleManageBooking = () => {
    showToast("Redirecting to your bookings...", "info");
    setTimeout(() => navigate('/user/bookings'), 1000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">My Dashboard</h1>
        <p className="text-forest-700/70 mt-1">Here is an overview of your stays and activities.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/user/search" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center text-forest-600 mb-3 group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">Find a Room</span>
        </Link>
        <Link to="/user/bookings" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center text-earth-600 mb-3 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">My Bookings</span>
        </Link>
        <Link to="/user/payments" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center text-forest-600 mb-3 group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">Payments</span>
        </Link>
        <Link to="/user/profile" className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex flex-col items-center justify-center text-center hover:border-forest-400 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center text-earth-600 mb-3 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6" />
          </div>
          <span className="font-medium text-forest-900">Profile</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Reservation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-forest-900">Upcoming Stay</h2>
            <Link to="/user/bookings" className="text-sm font-medium text-forest-600 hover:text-forest-800 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden flex flex-col sm:flex-row">
            <div className="sm:w-1/3 h-48 sm:h-auto bg-earth-200 relative">
              <img 
                src="https://images.unsplash.com/photo-1510798831971-661eb04b3739?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Forest Suite" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-forest-900 flex items-center gap-1">
                <Clock className="w-3 h-3" /> In 12 Days
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-serif font-semibold text-forest-900">Forest Suite</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Confirmed
                  </span>
                </div>
                <p className="text-forest-700/70 text-sm mb-4">Reservation #RES-49201</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-forest-700/50 mb-1">Check-in</p>
                    <p className="font-medium text-forest-900">Nov 15, 2023</p>
                    <p className="text-forest-700/70 text-xs">2:00 PM</p>
                  </div>
                  <div>
                    <p className="text-forest-700/50 mb-1">Check-out</p>
                    <p className="font-medium text-forest-900">Nov 18, 2023</p>
                    <p className="text-forest-700/70 text-xs">11:00 AM</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-earth-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-forest-700/50">Total Amount</p>
                  <p className="font-semibold text-forest-900">$750.00</p>
                </div>
                <button 
                  onClick={handleManageBooking}
                  className="px-4 py-2 bg-forest-50 text-forest-800 hover:bg-forest-100 rounded-xl text-sm font-medium transition-colors"
                >
                  Manage Booking
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-forest-900">Recent Activity</h2>
          
          <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-forest-900">Payment Successful</p>
                <p className="text-xs text-forest-700/70 mt-1">You paid $750.00 for RES-49201</p>
                <p className="text-xs text-forest-700/50 mt-2">2 days ago</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-forest-50 flex items-center justify-center text-forest-600 shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-forest-900">Booking Confirmed</p>
                <p className="text-xs text-forest-700/70 mt-1">Your stay at Forest Suite is confirmed.</p>
                <p className="text-xs text-forest-700/50 mt-2">2 days ago</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-earth-100 flex items-center justify-center text-earth-600 shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-forest-900">Review Published</p>
                <p className="text-xs text-forest-700/70 mt-1">Thank you for reviewing your past stay.</p>
                <p className="text-xs text-forest-700/50 mt-2">1 month ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
