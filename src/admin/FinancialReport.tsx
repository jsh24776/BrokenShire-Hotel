import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const phpCurrencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const financialData = [
  { month: 'Jan', revenue: 40000, expenses: 15000, profit: 25000 },
  { month: 'Feb', revenue: 30000, expenses: 12000, profit: 18000 },
  { month: 'Mar', revenue: 45000, expenses: 18000, profit: 27000 },
  { month: 'Apr', revenue: 50000, expenses: 20000, profit: 30000 },
  { month: 'May', revenue: 65000, expenses: 25000, profit: 40000 },
  { month: 'Jun', revenue: 70000, expenses: 28000, profit: 42000 },
];

export default function FinancialReport() {
  const navigate = useNavigate();

  const totals = {
    revenue: financialData.reduce((sum, item) => sum + item.revenue, 0),
    expenses: financialData.reduce((sum, item) => sum + item.expenses, 0),
    profit: financialData.reduce((sum, item) => sum + item.profit, 0),
  };

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
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Financial Report</h1>
          <p className="text-forest-700/70 mt-1">Detailed revenue, expenses, and profit analysis.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Total Revenue (YTD)</p>
              <p className="text-2xl font-bold text-forest-900 mt-2">
                {phpCurrencyFormatter.format(totals.revenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Total Expenses (YTD)</p>
              <p className="text-2xl font-bold text-forest-900 mt-2">
                {phpCurrencyFormatter.format(totals.expenses)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Total Profit (YTD)</p>
              <p className="text-2xl font-bold text-emerald-700 mt-2">
                {phpCurrencyFormatter.format(totals.profit)}
              </p>
              <p className="text-xs text-forest-700/60 mt-2">
                Margin: {((totals.profit / totals.revenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
        <h3 className="text-lg font-semibold text-forest-900 mb-6">Financial Breakdown</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2dcd1" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#7a604e', fontSize: 12 }}
                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => phpCurrencyFormatter.format(value as number)}
              />
              <Legend />
              <Bar dataKey="revenue" stackId="a" fill="#4a8760" name="Revenue" />
              <Bar dataKey="expenses" stackId="b" fill="#dc2626" name="Expenses" />
              <Bar dataKey="profit" fill="#059669" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="p-6 border-b border-earth-100 bg-earth-50/50">
          <h3 className="text-lg font-semibold text-forest-900">Monthly Ledger</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-earth-50 border-b border-earth-100">
                <th className="p-4 text-left font-medium text-forest-800">Month</th>
                <th className="p-4 text-right font-medium text-forest-800">Revenue</th>
                <th className="p-4 text-right font-medium text-forest-800">Expenses</th>
                <th className="p-4 text-right font-medium text-forest-800">Profit</th>
                <th className="p-4 text-right font-medium text-forest-800">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-earth-100">
              {financialData.map((item) => (
                <tr key={item.month} className="hover:bg-earth-50/50">
                  <td className="p-4 font-medium text-forest-900">{item.month}</td>
                  <td className="p-4 text-right text-emerald-700 font-medium">
                    {phpCurrencyFormatter.format(item.revenue)}
                  </td>
                  <td className="p-4 text-right text-red-700 font-medium">
                    {phpCurrencyFormatter.format(item.expenses)}
                  </td>
                  <td className="p-4 text-right text-forest-900 font-medium">
                    {phpCurrencyFormatter.format(item.profit)}
                  </td>
                  <td className="p-4 text-right text-forest-700">
                    {((item.profit / item.revenue) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-forest-50 font-semibold text-forest-900">
                <td className="p-4">Total</td>
                <td className="p-4 text-right text-emerald-700">
                  {phpCurrencyFormatter.format(totals.revenue)}
                </td>
                <td className="p-4 text-right text-red-700">
                  {phpCurrencyFormatter.format(totals.expenses)}
                </td>
                <td className="p-4 text-right">
                  {phpCurrencyFormatter.format(totals.profit)}
                </td>
                <td className="p-4 text-right">
                  {((totals.profit / totals.revenue) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
