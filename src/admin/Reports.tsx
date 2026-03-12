import { Download, FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react';
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
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const revenueData = [
  { name: 'Jan', value: 40000 },
  { name: 'Feb', value: 30000 },
  { name: 'Mar', value: 45000 },
  { name: 'Apr', value: 50000 },
  { name: 'May', value: 65000 },
  { name: 'Jun', value: 70000 },
];

const roomTypeData = [
  { name: 'Forest Suite', value: 400 },
  { name: 'Garden Retreat', value: 300 },
  { name: 'Canopy Villa', value: 150 },
];

const COLORS = ['#4a8760', '#a48b70', '#7a604e'];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Reports & Analytics</h1>
          <p className="text-forest-700/70 mt-1">Comprehensive insights into hotel performance.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-earth-200 text-forest-800 hover:bg-earth-50 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex items-start gap-4 cursor-pointer hover:border-forest-400 transition-colors">
          <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-forest-900">Financial Report</h3>
            <p className="text-sm text-forest-700/70 mt-1">Revenue, expenses, and profit margins.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex items-start gap-4 cursor-pointer hover:border-forest-400 transition-colors">
          <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center text-earth-600 shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-forest-900">Occupancy Report</h3>
            <p className="text-sm text-forest-700/70 mt-1">Room utilization and booking trends.</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex items-start gap-4 cursor-pointer hover:border-forest-400 transition-colors">
          <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600 shrink-0">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-forest-900">Guest Feedback</h3>
            <p className="text-sm text-forest-700/70 mt-1">Ratings, reviews, and satisfaction scores.</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-forest-900">Revenue Trend (YTD)</h3>
            <select className="bg-earth-50 border border-earth-200 text-forest-800 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-forest-500">
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a8760" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4a8760" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2dcd1" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="value" stroke="#4a8760" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <h3 className="text-lg font-semibold text-forest-900 mb-6">Bookings by Room Type</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {roomTypeData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-forest-800">{entry.name}</span>
                </div>
                <span className="font-medium text-forest-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
