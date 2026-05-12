import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Home, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const occupancyData = [
  { month: 'Jan', occupancy: 65, bookings: 120, roomsAvailable: 180 },
  { month: 'Feb', occupancy: 58, bookings: 105, roomsAvailable: 180 },
  { month: 'Mar', occupancy: 72, bookings: 130, roomsAvailable: 180 },
  { month: 'Apr', occupancy: 78, bookings: 145, roomsAvailable: 180 },
  { month: 'May', occupancy: 85, bookings: 160, roomsAvailable: 180 },
  { month: 'Jun', occupancy: 88, bookings: 165, roomsAvailable: 180 },
];

export default function OccupancyReport() {
  const navigate = useNavigate();

  const avgOccupancy = (
    occupancyData.reduce((sum, item) => sum + item.occupancy, 0) / occupancyData.length
  ).toFixed(1);

  const totalBookings = occupancyData.reduce((sum, item) => sum + item.bookings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/reports')}
          className="p-2 hover:bg-earth-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-forest-700" />
        </button>
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Occupancy Report</h1>
          <p className="text-forest-700/70 mt-1">Room utilization trends and booking analysis.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Average Occupancy</p>
              <p className="text-3xl font-bold text-forest-900 mt-2">{avgOccupancy}%</p>
              <p className="text-xs text-forest-700/60 mt-2">YTD average</p>
            </div>
            <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Total Bookings (YTD)</p>
              <p className="text-3xl font-bold text-forest-900 mt-2">{totalBookings}</p>
              <p className="text-xs text-forest-700/60 mt-2">Reservations</p>
            </div>
            <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center text-earth-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Available Rooms</p>
              <p className="text-3xl font-bold text-forest-900 mt-2">180</p>
              <p className="text-xs text-forest-700/60 mt-2">Total capacity</p>
            </div>
            <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600">
              <Home className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
        <h3 className="text-lg font-semibold text-forest-900 mb-6">Occupancy Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={occupancyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2dcd1" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#7a604e', fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`${value}%`, 'Occupancy']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="occupancy"
                stroke="#4a8760"
                strokeWidth={3}
                name="Occupancy %"
                dot={{ fill: '#4a8760', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="p-6 border-b border-earth-100 bg-earth-50/50">
          <h3 className="text-lg font-semibold text-forest-900">Monthly Occupancy Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-earth-50 border-b border-earth-100">
                <th className="p-4 text-left font-medium text-forest-800">Month</th>
                <th className="p-4 text-right font-medium text-forest-800">Occupancy %</th>
                <th className="p-4 text-right font-medium text-forest-800">Bookings</th>
                <th className="p-4 text-right font-medium text-forest-800">Rooms Available</th>
                <th className="p-4 text-right font-medium text-forest-800">Booked Rooms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {occupancyData.map((item) => {
                const bookedRooms = Math.round((item.occupancy / 100) * item.roomsAvailable);
                return (
                  <tr key={item.month} className="hover:bg-earth-50/50">
                    <td className="p-4 font-medium text-forest-900">{item.month}</td>
                    <td className="p-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {item.occupancy}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-forest-900">{item.bookings}</td>
                    <td className="p-4 text-right text-forest-700">{item.roomsAvailable}</td>
                    <td className="p-4 text-right text-forest-700">{bookedRooms}</td>
                  </tr>
                );
              })}
              <tr className="bg-forest-50 font-semibold text-forest-900">
                <td className="p-4">Average</td>
                <td className="p-4 text-right">{avgOccupancy}%</td>
                <td className="p-4 text-right">{(totalBookings / occupancyData.length).toFixed(0)}</td>
                <td className="p-4 text-right">180</td>
                <td className="p-4 text-right">
                  {Math.round(
                    (occupancyData.reduce((sum, item) => sum + item.occupancy, 0) / occupancyData.length / 100) * 180
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
