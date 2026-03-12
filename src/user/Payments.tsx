import { useState } from 'react';
import { CreditCard, FileText, Download, CheckCircle, Clock, XCircle, X, DollarSign, ShieldCheck } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const payments = [
  {
    id: 'PAY-89201',
    invoice: 'INV-2023-105',
    bookingRef: 'RES-49201',
    date: '2023-11-01',
    amount: '$750.00',
    method: 'Credit Card',
    status: 'Paid'
  },
  {
    id: 'PAY-78102',
    invoice: 'INV-2023-082',
    bookingRef: 'RES-38102',
    date: '2023-08-05',
    amount: '$360.00',
    method: 'PayPal',
    status: 'Paid'
  },
  {
    id: 'PAY-69011',
    invoice: 'INV-2023-045',
    bookingRef: 'RES-29011',
    date: '2023-04-28',
    amount: '$1800.00',
    method: 'Credit Card',
    status: 'Refunded'
  }
];

export default function Payments() {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showToast("Payment processed successfully!", "success");
    setShowModal(false);
    setIsProcessing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Refunded': return 'bg-slate-100 text-slate-800';
      default: return 'bg-earth-100 text-earth-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Payments & Invoices</h1>
          <p className="text-forest-700/70 mt-1">View your payment history and download receipts.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Make a Payment
        </button>
      </div>

      {/* Payment History Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
          <h2 className="text-lg font-semibold text-forest-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-earth-600" />
            Transaction History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-white text-forest-800 text-sm border-b border-earth-200">
                <th className="p-4 font-medium">Transaction ID</th>
                <th className="p-4 font-medium">Booking Ref</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="text-sm text-forest-900">
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none">
                  <td className="p-4 font-medium text-forest-700">{payment.id}</td>
                  <td className="p-4 text-forest-700/80">{payment.bookingRef}</td>
                  <td className="p-4">{payment.date}</td>
                  <td className="p-4 font-medium">{payment.amount}</td>
                  <td className="p-4 text-forest-700/80">{payment.method}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal Simulation */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <h2 className="text-xl font-serif font-semibold text-forest-900">Complete Payment</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="bg-forest-50 p-6 rounded-2xl border border-forest-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-forest-700/70">Invoice Amount</span>
                    <span className="text-2xl font-semibold text-forest-900">$750.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-forest-700/70">Booking Ref</span>
                    <span className="font-medium text-forest-800">RES-49201</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-forest-800">Select Payment Method</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="border-2 border-forest-500 bg-forest-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md">
                      <CreditCard className="w-6 h-6 text-forest-700" />
                      <span className="text-sm font-medium text-forest-900">Credit Card</span>
                    </button>
                    <button className="border-2 border-earth-200 hover:border-earth-300 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold italic text-xs">P</div>
                      <span className="text-sm font-medium text-forest-900">PayPal</span>
                    </button>
                  </div>
                </div>

                <div className="bg-earth-50 p-4 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <p className="text-[10px] text-forest-700/70 leading-relaxed">
                    Your payment is secured with 256-bit SSL encryption. We do not store your full credit card details.
                  </p>
                </div>

                <button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-forest-900/10"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Pay $750.00
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
