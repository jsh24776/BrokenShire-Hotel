import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  BedDouble, 
  CreditCard, 
  BarChart3,
  LogOut,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { clearAuth } from '../lib/auth';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Reservations', path: '/admin/reservations', icon: CalendarDays },
    { name: 'Guests', path: '/admin/guests', icon: Users },
    { name: 'Rooms', path: '/admin/rooms', icon: BedDouble },
    { name: 'Billing', path: '/admin/billing', icon: CreditCard },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  ];

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-earth-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-forest-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-forest-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-forest-800">
          <Leaf className="w-6 h-6 text-earth-400 mr-2" />
          <span className="font-serif text-xl font-semibold tracking-wide">Brokenshire Admin</span>
          <button 
            className="ml-auto lg:hidden text-forest-200 hover:text-white"
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
              end={item.path === '/admin'}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-forest-800 text-white font-medium' 
                    : 'text-forest-200 hover:bg-forest-800/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-forest-800">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-forest-200 hover:bg-forest-800 hover:text-white rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-earth-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
          <button 
            className="lg:hidden text-forest-800 hover:text-forest-900"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-earth-200 flex items-center justify-center text-forest-900 font-medium">
              AD
            </div>
            <span className="text-sm font-medium text-forest-900 hidden sm:block">Admin User</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
