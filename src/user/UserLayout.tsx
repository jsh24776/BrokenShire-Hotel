import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  CalendarDays, 
  CreditCard, 
  MessageSquare, 
  User,
  LogOut,
  Menu,
  X,
  Leaf,
  Bell
} from 'lucide-react';

export default function UserLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/user', icon: LayoutDashboard },
    { name: 'Search Rooms', path: '/user/search', icon: Search },
    { name: 'My Bookings', path: '/user/bookings', icon: CalendarDays },
    { name: 'Payments', path: '/user/payments', icon: CreditCard },
    { name: 'Feedback', path: '/user/feedback', icon: MessageSquare },
    { name: 'Profile', path: '/user/profile', icon: User },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-earth-200/50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-earth-200/50">
          <Leaf className="w-6 h-6 text-forest-600 mr-2" />
          <span className="font-serif text-xl font-semibold tracking-wide text-forest-900">Brokenshire</span>
          <button 
            className="ml-auto lg:hidden text-forest-800 hover:text-forest-900"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/user'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-forest-50 text-forest-900 font-medium shadow-sm' 
                    : 'text-forest-700/70 hover:bg-earth-50 hover:text-forest-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-earth-200/50">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-forest-700/70 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-earth-200/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
          <button 
            className="lg:hidden text-forest-800 hover:text-forest-900"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <button className="relative p-2 text-forest-700/70 hover:text-forest-900 transition-colors rounded-full hover:bg-earth-50">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-earth-200 mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-forest-900">Welcome back</div>
                <div className="text-xs text-forest-700/70">Guest Member</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-medium border border-forest-200 shadow-sm">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
