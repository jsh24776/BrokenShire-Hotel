import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, FileText, BarChart3, PieChart, TrendingUp, ArrowRight } from 'lucide-react';
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
  Cell,
  Legend
} from 'recharts';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const phpCurrencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const phpCompactFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 1,
});

function toFiniteNumber(value: unknown) {
  const numberValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

// Mock data for different years
const revenueDataByYear: Record<number, Array<{ name: string; value: number }>> = {
  2024: [
    { name: 'Jan', value: 40000 },
    { name: 'Feb', value: 30000 },
    { name: 'Mar', value: 45000 },
    { name: 'Apr', value: 50000 },
    { name: 'May', value: 65000 },
    { name: 'Jun', value: 70000 },
  ],
  2023: [
    { name: 'Jan', value: 35000 },
    { name: 'Feb', value: 28000 },
    { name: 'Mar', value: 42000 },
    { name: 'Apr', value: 48000 },
    { name: 'May', value: 60000 },
    { name: 'Jun', value: 65000 },
  ],
  2022: [
    { name: 'Jan', value: 30000 },
    { name: 'Feb', value: 25000 },
    { name: 'Mar', value: 35000 },
    { name: 'Apr', value: 40000 },
    { name: 'May', value: 50000 },
    { name: 'Jun', value: 55000 },
  ],
};

const roomTypeData = [
  { name: 'Forest Suite', value: 400 },
  { name: 'Garden Retreat', value: 300 },
  { name: 'Canopy Villa', value: 150 },
];

const COLORS = ['#4a8760', '#a48b70', '#7a604e'];

export default function Reports() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [revenueData, setRevenueData] = useState(revenueDataByYear[2024]);
  const [roomTypeTotal, setRoomTypeTotal] = useState(0);

  useEffect(() => {
    setRevenueData(revenueDataByYear[selectedYear]);
  }, [selectedYear]);

  useEffect(() => {
    const total = roomTypeData.reduce((sum, item) => sum + item.value, 0);
    setRoomTypeTotal(total);
  }, []);

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Title
      doc.setFontSize(20);
      doc.text('Hotel Analytics Report', pageWidth / 2, 20, { align: 'center' });
      
      // Date and year
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-PH')} | Year: ${selectedYear}`, pageWidth / 2, 28, { align: 'center' });
      
      // Revenue data summary
      doc.setFontSize(12);
      doc.text('Revenue Summary (YTD)', 20, 40);
      
      doc.setFontSize(10);
      let yPos = 48;
      revenueData.forEach((item) => {
        doc.text(`${item.name}: ${phpCurrencyFormatter.format(item.value)}`, 25, yPos);
        yPos += 6;
      });
      
      const revenueTotal = revenueData.reduce((sum, item) => sum + item.value, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Revenue: ${phpCurrencyFormatter.format(revenueTotal)}`, 25, yPos + 2);
      doc.setFont('helvetica', 'normal');
      
      // Room Type Summary
      doc.setFontSize(12);
      doc.text('Bookings by Room Type', 20, yPos + 15);
      
      doc.setFontSize(10);
      yPos += 23;
      roomTypeData.forEach((item) => {
        const percentage = ((item.value / roomTypeTotal) * 100).toFixed(1);
        doc.text(`${item.name}: ${item.value} bookings (${percentage}%)`, 25, yPos);
        yPos += 6;
      });
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Bookings: ${roomTypeTotal}`, 25, yPos + 2);
      doc.setFont('helvetica', 'normal');
      
      // Footer
      doc.setFontSize(8);
      doc.text(`Generated on ${new Date().toLocaleString('en-PH')}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      doc.save(`hotel-analytics-${selectedYear}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      
      // Revenue sheet
      const revenueSheet = [
        ['Month', 'Revenue'],
        ...revenueData.map(item => [item.name, item.value]),
        ['Total', revenueData.reduce((sum, item) => sum + item.value, 0)]
      ];
      
      // Room Type sheet
      const roomTypeSheet = [
        ['Room Type', 'Bookings', 'Percentage'],
        ...roomTypeData.map(item => [
          item.name,
          item.value,
          `${((item.value / roomTypeTotal) * 100).toFixed(1)}%`
        ]),
        ['Total', roomTypeTotal, '100%']
      ];
      
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(revenueSheet), 'Revenue');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(roomTypeSheet), 'Room Type');
      
      XLSX.writeFile(wb, `hotel-analytics-${selectedYear}.xlsx`);
    } catch (error) {
      console.error('Excel export failed:', error);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Reports & Analytics</h1>
          <p className="text-forest-700/70 mt-1">Comprehensive insights into hotel performance.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportPDF}
            className="bg-white border border-earth-200 text-forest-800 hover:bg-earth-50 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
            title="Export charts as PDF"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button 
            onClick={handleExportExcel}
            className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
            title="Export data as Excel"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Types Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/admin/reports/financial')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex items-start gap-4 hover:shadow-md hover:border-forest-400 transition-all text-left group"
        >
          <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600 shrink-0 group-hover:bg-forest-100 transition-colors">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-forest-900 flex items-center gap-2">
              Financial Report
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-forest-700/70 mt-1">Revenue, expenses, and profit margins.</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/reports/occupancy')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex items-start gap-4 hover:shadow-md hover:border-forest-400 transition-all text-left group"
        >
          <div className="w-12 h-12 bg-earth-100 rounded-xl flex items-center justify-center text-earth-600 shrink-0 group-hover:bg-earth-200 transition-colors">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-forest-900 flex items-center gap-2">
              Occupancy Report
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-forest-700/70 mt-1">Room utilization and booking trends.</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/reports/feedback')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 flex items-start gap-4 hover:shadow-md hover:border-forest-400 transition-all text-left group"
        >
          <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600 shrink-0 group-hover:bg-forest-100 transition-colors">
            <PieChart className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-forest-900 flex items-center gap-2">
              Guest Feedback
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-sm text-forest-700/70 mt-1">Ratings, reviews, and satisfaction scores.</p>
          </div>
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-forest-900">Revenue Trend (YTD)</h3>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-earth-50 border border-earth-200 text-forest-800 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-forest-500 cursor-pointer"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
              <option value={2022}>2022</option>
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
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} tickFormatter={(value) => phpCompactFormatter.format(toFiniteNumber(value))} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', padding: '12px' }}
                  labelStyle={{ color: '#4a7c59', fontWeight: 'bold' }}
                  formatter={(value) => [phpCurrencyFormatter.format(toFiniteNumber(value)), 'Revenue']}
                  labelFormatter={(label) => `${label} ${selectedYear}`}
                />
                <Area type="monotone" dataKey="value" stroke="#4a8760" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-forest-700/70">
            <strong>Total Revenue ({selectedYear}):</strong> {phpCurrencyFormatter.format(revenueData.reduce((sum, item) => sum + item.value, 0))}
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
                  formatter={(value) => [value, 'Bookings']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3 border-t border-earth-100 pt-4">
            {roomTypeData.map((entry, index) => {
              const percentage = ((entry.value / roomTypeTotal) * 100).toFixed(1);
              return (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-forest-800">{entry.name}</span>
                  </div>
                  <span className="font-medium text-forest-900">{entry.value} ({percentage}%)</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between text-sm font-semibold border-t border-earth-100 pt-3 text-forest-900">
              <span>Total</span>
              <span>{roomTypeTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
