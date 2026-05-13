import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CreditCard,
  FileText,
  Download,
  CheckCircle,
  X,
  ShieldCheck,
  ReceiptText,
} from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import jsPDF from 'jspdf';

type Booking = {
  id: number;
  reference: string;
  invoice_number?: string | null;
  room_number: string;
  room_name: string;
  room_type: string;
  image_url: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  amount_cents: number;
  currency: string;
  payment_method: 'hotel' | 'paypal';
  payment_reference: string | null;
  paid_at: string | null;
  payment_status: string;
  status: string;
  created_at: string | null;
};

function formatMoney(cents: number, currency: string) {
  const value = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: currency || 'PHP' }).format(value);
  } catch {
    return `₱${value.toLocaleString()}`;
  }
}

function titleCase(s: string) {
  return String(s)
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function paymentMethodLabel(method: 'hotel' | 'paypal') {
  return method === 'hotel' ? 'Pay at the hotel' : 'PayPal';
}

function formatDateShort(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-100 text-emerald-800';
    case 'unpaid':
      return 'bg-amber-100 text-amber-800';
    case 'refunded':
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-earth-100 text-earth-800';
  }
}

function printReceiptAsPdf(booking: Booking) {
  const datePaid = booking.paid_at ?? booking.created_at;
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${booking.reference} Receipt</title>
      <style>
        :root { color-scheme: light; }
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 24px; color: #0b2a1f; }
        .card { border: 1px solid #eadfd2; border-radius: 16px; overflow: hidden; max-width: 760px; margin: 0 auto; }
        .header { background: #f6f1ea; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 18px; font-weight: 700; }
        .sub { font-size: 12px; color: #34524a; margin-top: 4px; }
        .content { padding: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .box { background: #fbfaf8; border: 1px solid #eadfd2; border-radius: 14px; padding: 12px; }
        .label { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #6f6a63; font-weight: 700; }
        .value { margin-top: 6px; font-size: 14px; font-weight: 700; }
        .muted { font-size: 12px; color: #456b60; margin-top: 2px; }
        .totals { margin-top: 16px; border-top: 1px solid #eadfd2; padding-top: 14px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin-top: 8px; }
        .row strong { font-weight: 800; }
        .note { margin-top: 16px; background: #eef6f2; border: 1px solid #d8efe5; border-radius: 14px; padding: 12px; font-size: 12px; color: #1f4a3b; }
        @media print { body { padding: 0; } .card { border: none; border-radius: 0; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <div class="title">Brokenshire Hotel Receipt</div>
            <div class="sub">${booking.reference}</div>
          </div>
          <div class="sub">${formatDateShort(datePaid)}</div>
        </div>
        <div class="content">
          <div class="box">
            <div class="label">Room</div>
            <div class="value">${booking.room_name} (Room ${booking.room_number})</div>
            <div class="muted">${formatDateShort(booking.check_in_date)} → ${formatDateShort(booking.check_out_date)} • ${booking.nights} night(s)</div>
          </div>

          <div class="grid">
            <div class="box">
              <div class="label">Payment Method</div>
              <div class="value">${paymentMethodLabel(booking.payment_method)}</div>
              <div class="muted">Status: ${titleCase(booking.payment_status)}</div>
            </div>
            <div class="box">
              <div class="label">Invoice / Reference</div>
              <div class="value">${booking.payment_reference ?? '—'}</div>
              <div class="muted">Paid at: ${formatDateShort(booking.paid_at)}</div>
            </div>
          </div>

          <div class="totals">
            <div class="row"><span>Total Amount</span><strong>${formatMoney(booking.amount_cents, booking.currency || 'PHP')}</strong></div>
          </div>

          <div class="note">
            Keep this receipt for your records. You can also view your bookings anytime in the guest portal.
          </div>
        </div>
      </div>
      <script>
        window.onload = () => { window.focus(); window.print(); };
      </script>
    </body>
  </html>`;

  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function downloadReceiptPdf(booking: Booking) {
  const datePaid = booking.paid_at ?? booking.created_at;
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const left = 48;
  const right = pageWidth - left;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Brokenshire Hotel Receipt', pageWidth / 2, y, { align: 'center' });

  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(booking.reference, pageWidth / 2, y, { align: 'center' });

  y += 14;
  doc.text(`Date: ${formatDateShort(datePaid)}`, pageWidth / 2, y, { align: 'center' });

  y += 28;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Room', left, y);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`${booking.room_name} (Room ${booking.room_number})`, left, y, { maxWidth: right - left });

  y += 14;
  doc.setFontSize(10);
  doc.text(
    `${formatDateShort(booking.check_in_date)} - ${formatDateShort(booking.check_out_date)} • ${booking.nights} night(s)`,
    left,
    y,
    { maxWidth: right - left }
  );

  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Payment', left, y);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Method: ${paymentMethodLabel(booking.payment_method)}`, left, y);
  y += 14;
  doc.text(`Status: ${titleCase(booking.payment_status)}`, left, y);
  y += 14;
  doc.text(`Invoice / Reference: ${booking.payment_reference ?? '—'}`, left, y, { maxWidth: right - left });
  y += 14;
  doc.text(`Paid At: ${formatDateShort(booking.paid_at)}`, left, y);

  y += 26;
  doc.setDrawColor(210);
  doc.line(left, y, right, y);

  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Total Amount', left, y);
  doc.text(formatMoney(booking.amount_cents, booking.currency || 'PHP'), right, y, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Generated on ${new Date().toLocaleString('en-PH')}`, pageWidth / 2, pageHeight - 24, { align: 'center' });

  doc.save(`${booking.reference}-receipt.pdf`);
}

export default function Payments() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showPayModal, setShowPayModal] = useState(false);
  const [bookingToPayId, setBookingToPayId] = useState<number | null>(null);
  const [paypalInvoiceId, setPaypalInvoiceId] = useState<string | null>(null);
  const [paypalPaid, setPaypalPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  const fetchBookings = async (signal?: AbortSignal) => {
    setError(null);
    const res = await api.get('/bookings', { signal });
    setBookings(Array.isArray(res.data?.bookings) ? (res.data.bookings as Booking[]) : []);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    (async () => {
      try {
        await fetchBookings(controller.signal);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load your payments.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const transactions = useMemo(() => {
    const list = [...bookings];
    list.sort((a, b) => {
      const at = a.paid_at ?? a.created_at ?? '';
      const bt = b.paid_at ?? b.created_at ?? '';
      return new Date(bt).getTime() - new Date(at).getTime();
    });
    return list;
  }, [bookings]);

  const unpaidBookings = useMemo(
    () => bookings.filter((b) => b.payment_status !== 'paid' && b.status !== 'cancelled' && b.status !== 'checked_out'),
    [bookings]
  );

  const bookingToPay = useMemo(
    () => unpaidBookings.find((b) => b.id === bookingToPayId) ?? unpaidBookings[0] ?? null,
    [bookingToPayId, unpaidBookings]
  );

  const openPayModal = () => {
    if (unpaidBookings.length === 0) {
      showToast('No unpaid bookings found.', 'info');
      return;
    }
    setBookingToPayId(unpaidBookings[0].id);
    setPaypalInvoiceId(`PP-${Date.now()}`);
    setPaypalPaid(false);
    setIsProcessing(false);
    setShowPayModal(true);
  };

  const handlePayNow = async () => {
    if (!bookingToPay) return;
    if (!paypalInvoiceId) {
      setPaypalInvoiceId(`PP-${Date.now()}`);
      showToast('Invoice generated. Please try again.', 'info');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulated PayPal: a short delay for UX, then we finalize via backend.
      await new Promise((r) => setTimeout(r, 900));
      const res = await api.patch(`/bookings/${bookingToPay.id}/pay`, {
        payment_method: 'paypal',
        payment_reference: paypalInvoiceId,
      });

      const updated = res.data?.booking as Booking | undefined;
      setPaypalPaid(true);
      showToast('Payment completed. Receipt is ready.', 'success');
      await fetchBookings();

      if (updated) setReceiptBooking(updated);
      setShowPayModal(false);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Payment failed.';
      showToast(String(message), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Payments & Invoices</h1>
          <p className="text-forest-700/70 mt-1">View your payment history, receipts, and download a PDF copy.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
          <h2 className="text-lg font-semibold text-forest-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-earth-600" />
            Transaction History
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-forest-700/70">Loading your transactions...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-forest-700/70">No transactions yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-white text-forest-800 text-sm border-b border-earth-200">
                  <th className="p-4 font-medium">Booking</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="text-sm text-forest-900">
                {transactions.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none"
                  >
                    <td className="p-4">
                      <div className="font-medium text-forest-800">{b.reference}</div>
                      <div className="text-xs text-forest-700/60">
                        {b.room_name} • Room {b.room_number}
                        {b.invoice_number ? <span className="text-forest-700/40"> • {b.invoice_number}</span> : null}
                      </div>
                    </td>
                    <td className="p-4">{formatDateShort(b.paid_at ?? b.created_at)}</td>
                    <td className="p-4 font-medium">{formatMoney(b.amount_cents, b.currency || 'PHP')}</td>
                    <td className="p-4 text-forest-700/80">{paymentMethodLabel(b.payment_method)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          b.payment_status
                        )}`}
                      >
                        {titleCase(b.payment_status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setReceiptBooking(b)}
                          className="p-1.5 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5"
                        >
                          <ReceiptText className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => downloadReceiptPdf(b)}
                          className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
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
                <button onClick={() => setShowPayModal(false)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {bookingToPay ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-forest-800">Select unpaid booking</label>
                      <select
                        value={bookingToPay.id}
                        onChange={(e) => {
                          setBookingToPayId(Number(e.target.value));
                          setPaypalInvoiceId(`PP-${Date.now()}`);
                          setPaypalPaid(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white"
                      >
                        {unpaidBookings.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.reference} — {b.room_name} ({formatMoney(b.amount_cents, b.currency || 'PHP')})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-forest-50 p-6 rounded-2xl border border-forest-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-forest-700/70">Amount</span>
                        <span className="text-2xl font-semibold text-forest-900">
                          {formatMoney(bookingToPay.amount_cents, bookingToPay.currency || 'PHP')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-forest-700/70">Booking Ref</span>
                        <span className="font-medium text-forest-800">{bookingToPay.reference}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-forest-700/70">PayPal Invoice</span>
                        <span className="font-medium text-forest-800">{paypalInvoiceId ?? '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-forest-800">Payment method</p>
                      <div className="border-2 border-forest-500 bg-forest-50 p-4 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#003087] rounded-xl flex items-center justify-center text-white font-bold italic text-sm">
                            PP
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-forest-900">PayPal</p>
                            <p className="text-[10px] text-forest-700/60">Simulated payment for the student project.</p>
                          </div>
                        </div>
                        {paypalPaid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-earth-50 p-4 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <p className="text-[10px] text-forest-700/70 leading-relaxed">
                        In a real system, PayPal payments are verified server-side using webhooks. This project simulates the flow.
                      </p>
                    </div>

                    <button
                      onClick={handlePayNow}
                      disabled={isProcessing}
                      className="w-full bg-forest-700 hover:bg-forest-800 text-white py-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-forest-900/10"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Pay Now
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="text-sm text-forest-700/70">No unpaid bookings found.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {receiptBooking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReceiptBooking(null)}
              className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-earth-100 flex justify-between items-center bg-earth-50/50">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-forest-900">Receipt</h2>
                  <p className="text-sm text-forest-700/60">{receiptBooking.reference}</p>
                </div>
                <button onClick={() => setReceiptBooking(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex gap-4 items-start">
                  {receiptBooking.image_url ? (
                    <img
                      src={receiptBooking.image_url}
                      alt={receiptBooking.room_name}
                      className="w-24 h-24 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-earth-50" />
                  )}
                  <div>
                    <h3 className="text-lg font-serif font-semibold text-forest-900">{receiptBooking.room_name}</h3>
                    <p className="text-sm text-forest-700/60">Room {receiptBooking.room_number}</p>
                    <span
                      className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                        receiptBooking.payment_status
                      )}`}
                    >
                      {titleCase(receiptBooking.payment_status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 py-6 border-y border-earth-100">
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-in</p>
                    <p className="font-medium text-forest-900">{formatDateShort(receiptBooking.check_in_date)}</p>
                    <p className="text-xs text-forest-700/60">After 2:00 PM</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-forest-700/50 uppercase tracking-wider">Check-out</p>
                    <p className="font-medium text-forest-900">{formatDateShort(receiptBooking.check_out_date)}</p>
                    <p className="text-xs text-forest-700/60">Before 11:00 AM</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Nights</span>
                    <span className="font-medium text-forest-900">{receiptBooking.nights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Total Amount</span>
                    <span className="font-semibold text-forest-900">
                      {formatMoney(receiptBooking.amount_cents, receiptBooking.currency || 'PHP')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Payment Method</span>
                    <span className="font-medium text-forest-900">{paymentMethodLabel(receiptBooking.payment_method)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Invoice / Reference</span>
                    <span className="font-medium text-forest-900">{receiptBooking.payment_reference ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Paid At</span>
                    <span className="font-medium text-forest-900">{formatDateShort(receiptBooking.paid_at)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="bg-forest-50 p-4 rounded-2xl border border-forest-100 flex items-start gap-3 flex-1">
                    <ShieldCheck className="w-5 h-5 text-forest-600 mt-0.5" />
                    <p className="text-xs text-forest-800/80 leading-relaxed">
                      You can download a PDF copy of this receipt anytime.
                    </p>
                  </div>  
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
