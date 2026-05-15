/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ToastContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Reservations from './admin/Reservations';
import Guests from './admin/Guests';
import RoomsAdmin from './admin/Rooms';
import Billing from './admin/Billing';
import Reports from './admin/Reports';
import FinancialReport from './admin/FinancialReport';
import OccupancyReport from './admin/OccupancyReport';
import GuestFeedback from './admin/GuestFeedback';

import UserLayout from './user/UserLayout';
import UserDashboard from './user/Dashboard';
import SearchRooms from './user/SearchRooms';
import MyBookings from './user/MyBookings';
import Payments from './user/Payments';
import Feedback from './user/Feedback';
import Profile from './user/Profile';

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="guests" element={<Guests />} />
            <Route path="rooms" element={<RoomsAdmin />} />
            <Route path="billing" element={<Billing />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/financial" element={<FinancialReport />} />
            <Route path="reports/occupancy" element={<OccupancyReport />} />
            <Route path="reports/feedback" element={<GuestFeedback />} />
          </Route>

          {/* User Routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="search" element={<SearchRooms />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  );
}
