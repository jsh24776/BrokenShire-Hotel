import { useState } from 'react';
import { Search, Filter, Download, FileText, CreditCard, MoreVertical, X, CheckCircle, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';

const initialInvoices = [
  { id: 'INV-2023-001', guest: 'Sarah Jenkins', date: '2023-10-25', amount: '₱750.00', status: 'Paid', method: 'Credit Card' },
  { id: 'INV-2023-002', guest: 'Michael Chen', date: '2023-10-25', amount: '₱2,360.00', status: 'Pending', method: '-' },
  { id: 'INV-2023-003', guest: 'Emily Davis', date: '2023-10-26', amount: '₱1,800.00', status: 'Paid', method: 'PayPal' },
  { id: 'INV-2023-004', guest: 'Robert Wilson', date: '2023-10-22', amount: '₱250.00', status: 'Paid', method: 'Cash' },
  { id: 'INV-2023-005', guest: 'Amanda Taylor', date: '2023-10-28', amount: '₱1,500.00', status: 'Refunded', method: 'Credit Card' },
];

export default function Billing() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleRecordPayment = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    showToast("Payment recorded successfully!", "success");
    setIsSaving(false);
    setShowPaymentModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Refunded': return 'bg-slate-100 text-slate-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-earth-100 text-earth-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Payment & Billing</h1>
          <p className="text-forest-700/70 mt-1">Manage invoices, payments, and refunds.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-earth-200 text-forest-800 hover:bg-earth-50 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
          <input
            type="text"
            placeholder="Search by invoice ID or guest name..."
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
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Guest Name</th>
                <th className="p-4 font-medium">Date Issued</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Payment Method</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-forest-900">
              {initialInvoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none">
                  <td className="p-4 font-medium text-forest-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-earth-500" />
                    {invoice.id}
                  </td>
                  <td className="p-4">{invoice.guest}</td>
                  <td className="p-4">{invoice.date}</td>
                  <td className="p-4 font-medium">{invoice.amount}</td>
                  <td className="p-4 text-forest-700/80">{invoice.method}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors" title="View Receipt">
                        <FileText className="w-4 h-4" />
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
      {/* Record Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Record Payment</h2>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Guest / Invoice</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <input type="text" placeholder="Search guest or invoice ID" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Amount Received</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                        <input type="number" placeholder="0.00" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Payment Method</label>
                      <select className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none appearance-none">
                        <option>Credit Card</option>
                        <option>PayPal</option>
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-forest-800">Notes (Optional)</label>
                    <textarea rows={3} placeholder="Add any payment details..." className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none resize-none"></textarea>
                  </div>
                </div>
                
                <button 
                  onClick={handleRecordPayment}
                  disabled={isSaving}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
