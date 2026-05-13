import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  CalendarDays, 
  CreditCard, 
  BedDouble,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import axios from 'axios';

// Mock data for different time ranges
const weeklyRevenueData = [
  { name: 'Mon', value: 4200 },
  { name: 'Tue', value: 3800 },
  { name: 'Wed', value: 5100 },
  { name: 'Thu', value: 4900 },
  { name: 'Fri', value: 7200 },
  { name: 'Sat', value: 8500 },
  { name: 'Sun', value: 6800 },
];

const monthlyRevenueData = [
  { name: 'Week 1', value: 28450 },
  { name: 'Week 2', value: 31200 },
  { name: 'Week 3', value: 35800 },
  { name: 'Week 4', value: 32100 },
];

const occupancyData = [
  { name: 'Week 1', rate: 68 },
  { name: 'Week 2', rate: 72 },
  { name: 'Week 3', rate: 88 },
  { name: 'Week 4', rate: 82 },
];

const roomTypeDataFull = [
  { name: 'Forest Suite', value: 45, color: '#4a8760' },
  { name: 'Garden Retreat', value: 30, color: '#a48b70' },
  { name: 'Canopy Villa', value: 25, color: '#20382a' },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  const [revenueData, setRevenueData] = useState(weeklyRevenueData);
  const [kpiData, setKpiData] = useState({
    totalBookings: 124,
    bookingsLastMonth: 110,
    occupancyRate: 82,
    occupancyLastMonth: 78,
    dailyRevenue: 28450,
    yesterdayRevenue: 29000,
    pendingPayments: 12,
  });
  const [roomTypeData, setRoomTypeData] = useState(roomTypeDataFull);

  // TC-DASH-062: Time Range Toggle - Update chart based on selection
  useEffect(() => {
    if (timeRange === '7days') {
      setRevenueData(weeklyRevenueData);
    } else {
      setRevenueData(monthlyRevenueData);
    }
  }, [timeRange]);

  // TC-DASH-066: Daily Revenue Reset at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setDate(nextMidnight.getDate() + 1);
      nextMidnight.setHours(0, 0, 0, 0);

      const timeUntilMidnight = nextMidnight.getTime() - now.getTime();
      const timeout = setTimeout(() => {
        // Reset daily revenue to 0
        setKpiData((prev) => ({
          ...prev,
          yesterdayRevenue: prev.dailyRevenue,
          dailyRevenue: 0,
        }));
      }, timeUntilMidnight);

      return () => clearTimeout(timeout);
    };

    return checkMidnight();
  }, []);

  // TC-DASH-059: Calculate percentage change
  const bookingPercentageChange = useMemo(() => {
    const change = ((kpiData.totalBookings - kpiData.bookingsLastMonth) / kpiData.bookingsLastMonth) * 100;
    return change.toFixed(1);
  }, [kpiData.totalBookings, kpiData.bookingsLastMonth]);

  const occupancyPercentageChange = useMemo(() => {
    const change = ((kpiData.occupancyRate - kpiData.occupancyLastMonth) / kpiData.occupancyLastMonth) * 100;
    return change.toFixed(1);
  }, [kpiData.occupancyRate, kpiData.occupancyLastMonth]);

  const revenuePercentageChange = useMemo(() => {
    const change = ((kpiData.dailyRevenue - kpiData.yesterdayRevenue) / kpiData.yesterdayRevenue) * 100;
    return change.toFixed(1);
  }, [kpiData.dailyRevenue, kpiData.yesterdayRevenue]);

  // TC-DASH-063: Zero State Handling - Filter out room types with 0 value
  const filteredRoomTypeData = useMemo(() => {
    return roomTypeData.filter((item) => item.value > 0);
  }, [roomTypeData]);

  const totalRoomRevenue = useMemo(() => {
    return filteredRoomTypeData.reduce((sum, item) => sum + item.value, 0);
  }, [filteredRoomTypeData]);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Dashboard Overview</h1>
        <p className="text-forest-700/70 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TC-DASH-059: Percentage Calculation */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700/70">Total Bookings</p>
              <h3 className="text-2xl font-semibold text-forest-900 mt-1">{kpiData.totalBookings}</h3>
            </div>
            <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center text-forest-600">
              <CalendarDays className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-medium ${Number(bookingPercentageChange) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Number(bookingPercentageChange) >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(Number(bookingPercentageChange))}%
            </span>
            <span className="text-forest-700/50 ml-2">vs last month</span>
          </div>
        </div>

        {/* TC-DASH-067: Occupancy Rate Logic */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700/70">Occupancy Rate</p>
              <h3 className="text-2xl font-semibold text-forest-900 mt-1">{kpiData.occupancyRate}%</h3>
            </div>
            <div className="w-12 h-12 bg-earth-100 rounded-full flex items-center justify-center text-earth-600">
              <BedDouble className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-medium ${Number(occupancyPercentageChange) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Number(occupancyPercentageChange) >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(Number(occupancyPercentageChange))}%
            </span>
            <span className="text-forest-700/50 ml-2">vs last month</span>
          </div>
        </div>

        {/* TC-DASH-066: Daily Revenue Reset */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700/70">Daily Revenue</p>
              <h3 className="text-2xl font-semibold text-forest-900 mt-1">{formatCurrency(kpiData.dailyRevenue)}</h3>
            </div>
            <div className="w-12 h-12 bg-forest-50 rounded-full flex items-center justify-center text-forest-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center font-medium ${Number(revenuePercentageChange) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {Number(revenuePercentageChange) >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
              {Math.abs(Number(revenuePercentageChange))}%
            </span>
            <span className="text-forest-700/50 ml-2">vs yesterday</span>
          </div>
        </div>

        {/* TC-DASH-060: Pending Payments Alert */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 hover:border-red-200 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-forest-700/70">Pending Payments</p>
              <h3 className="text-2xl font-semibold text-forest-900 mt-1">{kpiData.pendingPayments}</h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 font-medium">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          {/* TC-DASH-062: Time Range Toggle */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-forest-900">Weekly Revenue</h3>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '7days' | '30days')}
              className="text-xs font-medium text-forest-700 bg-earth-50 border border-earth-200 rounded-lg px-3 py-1.5 outline-none focus:border-forest-500 cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a8760" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4a8760" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2dcd1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#20382a', fontWeight: '600' }}
                  formatter={(value) => `₱${value?.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="value" stroke="#4a8760" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TC-DASH-061: Revenue by Room Type (with TC-DASH-063: Zero State Handling) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <h3 className="text-lg font-semibold text-forest-900 mb-6">Revenue by Room Type</h3>
          {filteredRoomTypeData.length > 0 ? (
            <>
              <div className="h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredRoomTypeData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {filteredRoomTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => {
                        const percentage = ((value as number / totalRoomRevenue) * 100).toFixed(1);
                        return `${percentage}%`;
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-xs font-medium text-forest-800">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-xs text-forest-700/50 uppercase tracking-wider font-bold">Total</p>
                  <p className="text-xl font-bold text-forest-900">100%</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <p className="text-forest-700/70">No room revenue data available</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-forest-900">Monthly Occupancy Trend</h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-earth-400" />
              <span className="text-xs font-medium text-forest-700/70">Occupancy Rate (%)</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2dcd1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f2f7f4' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `${value}%`}
                />
                <Bar dataKey="rate" fill="#a48b70" radius={[10, 10, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="p-6 border-b border-earth-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-forest-900">Recent Arrivals</h3>
          <button className="text-sm font-medium text-forest-600 hover:text-forest-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-earth-50 text-forest-800 text-sm border-b border-earth-200">
                <th className="p-4 font-medium">Guest Name</th>
                <th className="p-4 font-medium">Room</th>
                <th className="p-4 font-medium">Check-in</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm text-forest-900">
              <tr className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-medium">
                    SJ
                  </div>
                  Sarah Jenkins
                </td>
                <td className="p-4">101 - Forest Suite</td>
                <td className="p-4">Today, 2:00 PM</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Checked In
                  </span>
                </td>
              </tr>
              <tr className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-earth-200 text-earth-800 flex items-center justify-center font-medium">
                    MC
                  </div>
                  Michael Chen
                </td>
                <td className="p-4">204 - Garden Retreat</td>
                <td className="p-4">Today, 3:30 PM</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Pending
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-forest-50/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center font-medium">
                    ED
                  </div>
                  Emily Davis
                </td>
                <td className="p-4">305 - Canopy Villa</td>
                <td className="p-4">Today, 4:00 PM</td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Pending
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
