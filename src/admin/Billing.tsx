import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Search, Download, FileText, CreditCard, X, CheckCircle, RefreshCcw, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

type ReservationRow = {
  id: number;
  user_id: number;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  amount_cents: number;
  currency: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  payment_status: string;
  status: string;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
  invoice?: {
    invoice_number: string;
    payment_status: string;
    payment_method: 'hotel' | 'paypal' | null;
    payment_reference: string | null;
    paid_at: string | null;
  } | null;
};

type Invoice = {
  reservation_id: number;
  invoice_id: string;
  reservation_ref: string;
  guest_name: string;
  guest_email: string;
  date_issued: string;
  amount_cents: number;
  currency: string;
  payment_method: 'hotel' | 'paypal' | null;
  payment_reference: string | null;
  paid_at: string | null;
  payment_status: 'paid' | 'unpaid' | 'refunded' | string;
  reservation_status: string;
  room_number: string;
  room_type: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
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

function formatDateShort(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
}

function paymentMethodLabel(method: Invoice['payment_method']) {
  if (!method) return '—';
  return method === 'paypal' ? 'PayPal' : 'Pay at the hotel';
}

function getStatusColor(status: string) {
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

function printInvoiceAsPdf(invoice: Invoice) {
  const issued = invoice.paid_at ?? invoice.date_issued;
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>${invoice.invoice_id}</title>
      <style>
        body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 24px; color: #0b2a1f; }
        .card { border: 1px solid #eadfd2; border-radius: 16px; overflow: hidden; max-width: 860px; margin: 0 auto; }
        .header { background: #f6f1ea; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 18px; font-weight: 800; }
        .sub { font-size: 12px; color: #34524a; margin-top: 4px; }
        .content { padding: 20px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
        .box { background: #fbfaf8; border: 1px solid #eadfd2; border-radius: 14px; padding: 12px; }
        .label { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #6f6a63; font-weight: 800; }
        .value { margin-top: 6px; font-size: 14px; font-weight: 800; }
        .muted { font-size: 12px; color: #456b60; margin-top: 2px; }
        .totals { margin-top: 16px; border-top: 1px solid #eadfd2; padding-top: 14px; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin-top: 8px; }
        .row strong { font-weight: 900; }
        @media print { body { padding: 0; } .card { border: none; border-radius: 0; } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <div class="title">Brokenshire Hotel Invoice</div>
            <div class="sub">${invoice.invoice_id} • ${invoice.reservation_ref}</div>
          </div>
          <div class="sub">${formatDateShort(issued)}</div>
        </div>
        <div class="content">
          <div class="grid">
            <div class="box">
              <div class="label">Guest</div>
              <div class="value">${invoice.guest_name}</div>
              <div class="muted">${invoice.guest_email}</div>
            </div>
            <div class="box">
              <div class="label">Payment</div>
              <div class="value">${titleCase(invoice.payment_status)}</div>
              <div class="muted">${paymentMethodLabel(invoice.payment_method)} • ${invoice.payment_reference ?? '—'}</div>
            </div>
          </div>
          <div class="box" style="margin-top: 12px;">
            <div class="label">Stay</div>
            <div class="value">Room ${invoice.room_number} • ${invoice.room_type}</div>
            <div class="muted">${formatDateShort(invoice.check_in_date)} → ${formatDateShort(invoice.check_out_date)} • ${invoice.nights} night(s)</div>
          </div>
          <div class="totals">
            <div class="row"><span>Total Amount</span><strong>${formatMoney(invoice.amount_cents, invoice.currency)}</strong></div>
          </div>
        </div>
      </div>
      <script>window.onload = () => { window.focus(); window.print(); };</script>
    </body>
  </html>`;

  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}

export default function Billing() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ReservationRow[]>([]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [paymentTargetId, setPaymentTargetId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'hotel' | 'paypal'>('hotel');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchInvoices = async (signal?: AbortSignal, term?: string) => {
    setError(null);
    const res = await api.get('/admin/reservations', {
      signal,
      params: { search: term ?? searchTerm, per_page: 50 },
    });
    const data = Array.isArray(res.data?.data) ? (res.data.data as ReservationRow[]) : [];
    setRows(data);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    (async () => {
      try {
        await fetchInvoices(controller.signal, '');
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load invoices.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        await fetchInvoices(controller.signal, searchTerm);
      } catch {
        // ignore
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const invoices: Invoice[] = useMemo(() => {
    return rows.map((r) => {
      const year = new Date(r.created_at).getFullYear();
      const invoiceId = r.invoice?.invoice_number ?? `INV-${year}-${String(r.id).padStart(5, '0')}`;
      const reservationRef = `RES-${String(r.id).padStart(4, '0')}`;

      const rawMethod = r.invoice?.payment_method ?? (r.payment_method as any);
      const pm = rawMethod === 'paypal' ? 'paypal' : (rawMethod ? 'hotel' : null);

      return {
        reservation_id: r.id,
        invoice_id: invoiceId,
        reservation_ref: reservationRef,
        guest_name: r.user?.name ?? '—',
        guest_email: r.user?.email ?? '—',
        date_issued: r.created_at,
        amount_cents: r.amount_cents,
        currency: r.currency ?? 'PHP',
        payment_method: pm,
        payment_reference: r.invoice?.payment_reference ?? r.payment_reference ?? null,
        paid_at: r.invoice?.paid_at ?? r.paid_at ?? null,
        payment_status: (r.invoice?.payment_status as any) ?? (r.payment_status as any) ?? 'unpaid',
        reservation_status: r.status ?? 'pending',
        room_number: r.room_number,
        room_type: r.room_type,
        check_in_date: r.check_in_date,
        check_out_date: r.check_out_date,
        nights: r.nights,
      };
    });
  }, [rows]);

  const filteredInvoices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((i) => {
      return (
        i.invoice_id.toLowerCase().includes(q) ||
        i.reservation_ref.toLowerCase().includes(q) ||
        i.guest_name.toLowerCase().includes(q) ||
        i.guest_email.toLowerCase().includes(q)
      );
    });
  }, [invoices, searchTerm]);

  const unpaidInvoices = useMemo(
    () => invoices.filter((i) => i.payment_status !== 'paid' && i.reservation_status !== 'cancelled'),
    [invoices]
  );

  const openRecordPayment = (invoice?: Invoice) => {
    const target = invoice ?? unpaidInvoices[0] ?? null;
    if (!target) {
      showToast('No unpaid invoices found.', 'info');
      return;
    }
    setPaymentTargetId(target.reservation_id);
    setPaymentMethod('hotel');
    setPaymentReference(`CASH-${Date.now()}`);
    setShowPaymentModal(true);
  };

  const handleRecordPayment = async () => {
    if (!paymentTargetId) return;
    setIsSaving(true);
    try {
      await api.patch(`/admin/reservations/${paymentTargetId}/record-payment`, {
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
      });
      showToast('Payment recorded successfully!', 'success');
      await fetchInvoices(undefined, searchTerm);
      setShowPaymentModal(false);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Failed to record payment.';
      showToast(String(message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefund = async (invoice: Invoice) => {
    setIsSaving(true);
    try {
      await api.patch(`/admin/reservations/${invoice.reservation_id}/refund`);
      showToast(`${invoice.invoice_id} refunded.`, 'success');
      await fetchInvoices(undefined, searchTerm);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ?? 'Failed to refund invoice.';
      showToast(String(message), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const exportCsv = () => {
    const header = [
      'invoice_id',
      'reservation_ref',
      'guest_name',
      'guest_email',
      'date_issued',
      'amount',
      'currency',
      'payment_method',
      'payment_reference',
      'payment_status',
      'paid_at',
    ];

    const body = filteredInvoices.map((i) => [
      i.invoice_id,
      i.reservation_ref,
      i.guest_name,
      i.guest_email,
      i.date_issued,
      String(i.amount_cents),
      i.currency,
      i.payment_method ?? '',
      i.payment_reference ?? '',
      i.payment_status,
      i.paid_at ?? '',
    ]);

    const csv = [header, ...body]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brokenshire_billing_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Exported billing CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Payment & Billing</h1>
          <p className="text-forest-700/70 mt-1">Manage invoices, payments, and refunds.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCsv}
            className="bg-white border border-earth-200 text-forest-800 hover:bg-earth-50 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openRecordPayment()}
            className="bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-earth-100 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest-800/40" />
          <input
            type="text"
            placeholder="Search by invoice ID, reservation, or guest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all"
          />
        </div>
        <button
          onClick={async () => {
            setIsLoading(true);
            try {
              await fetchInvoices(undefined, searchTerm);
              showToast('Billing refreshed.', 'success');
            } catch {
              // ignore
            } finally {
              setIsLoading(false);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 border border-earth-200 rounded-xl text-forest-800 hover:bg-earth-50 transition-colors"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-forest-700/70">Loading billing records...</div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">{error}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-forest-700/70">No invoices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-earth-50 text-forest-800 text-sm border-b border-earth-200">
                  <th className="p-4 font-medium">Invoice ID</th>
                  <th className="p-4 font-medium">Guest</th>
                  <th className="p-4 font-medium">Issued</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm text-forest-900">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.invoice_id}
                    className="border-b border-earth-100 hover:bg-forest-50/50 transition-colors last:border-none"
                  >
                    <td className="p-4">
                      <div className="font-medium text-forest-800">{inv.invoice_id}</div>
                      <div className="text-xs text-forest-700/60">{inv.reservation_ref}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{inv.guest_name}</div>
                      <div className="text-xs text-forest-700/60">{inv.guest_email}</div>
                    </td>
                    <td className="p-4">{formatDateShort(inv.date_issued)}</td>
                    <td className="p-4 font-medium">{formatMoney(inv.amount_cents, inv.currency)}</td>
                    <td className="p-4 text-forest-700/80">{paymentMethodLabel(inv.payment_method)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inv.payment_status)}`}>
                        {titleCase(inv.payment_status)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5"
                          title="View Receipt"
                        >
                          <FileText className="w-4 h-4" /> View
                        </button>
                        {inv.payment_status !== 'paid' ? (
                          <button
                            onClick={() => openRecordPayment(inv)}
                            className="p-1.5 text-forest-800 hover:bg-forest-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5"
                          >
                            <CreditCard className="w-4 h-4" /> Pay
                          </button>
                        ) : (
                          <button
                            disabled={isSaving}
                            onClick={() => handleRefund(inv)}
                            className="p-1.5 text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5 disabled:opacity-60"
                          >
                            Refund
                          </button>
                        )}
                        <button
                          onClick={() => printInvoiceAsPdf(inv)}
                          className="p-1.5 text-forest-600 hover:bg-forest-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-earth-200 px-3 py-1.5"
                        >
                          <Download className="w-4 h-4" /> PDF
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
                    <label className="text-sm font-medium text-forest-800">Unpaid Invoice</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest-400" />
                      <select
                        value={paymentTargetId ?? ''}
                        onChange={(e) => setPaymentTargetId(Number(e.target.value))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none bg-white appearance-none"
                      >
                        {unpaidInvoices.map((i) => (
                          <option key={i.invoice_id} value={i.reservation_id}>
                            {i.invoice_id} — {i.guest_name} ({formatMoney(i.amount_cents, i.currency)})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => {
                          const v = e.target.value as 'hotel' | 'paypal';
                          setPaymentMethod(v);
                          setPaymentReference(v === 'paypal' ? `PP-${Date.now()}` : `CASH-${Date.now()}`);
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none appearance-none bg-white"
                      >
                        <option value="hotel">Pay at the hotel (cash)</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-forest-800">Reference (Optional)</label>
                      <input
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. CASH-123 / PP-123"
                        className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRecordPayment}
                  disabled={isSaving || !paymentTargetId}
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

      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvoice(null)}
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
                  <h2 className="text-xl font-serif font-semibold text-forest-900">Invoice</h2>
                  <p className="text-sm text-forest-700/60">{selectedInvoice.invoice_id}</p>
                </div>
                <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-earth-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-forest-800/50" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-earth-50 p-5 rounded-2xl border border-earth-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-forest-700/40 uppercase tracking-widest">Guest</p>
                      <p className="font-semibold text-forest-900 mt-1">{selectedInvoice.guest_name}</p>
                      <p className="text-xs text-forest-700/60">{selectedInvoice.guest_email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInvoice.payment_status)}`}>
                      {titleCase(selectedInvoice.payment_status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Reservation</span>
                    <span className="font-medium text-forest-900">{selectedInvoice.reservation_ref}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Stay</span>
                    <span className="font-medium text-forest-900">
                      Room {selectedInvoice.room_number} • {selectedInvoice.room_type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Dates</span>
                    <span className="font-medium text-forest-900">
                      {formatDateShort(selectedInvoice.check_in_date)} → {formatDateShort(selectedInvoice.check_out_date)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Amount</span>
                    <span className="font-semibold text-forest-900">{formatMoney(selectedInvoice.amount_cents, selectedInvoice.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Payment Method</span>
                    <span className="font-medium text-forest-900">{paymentMethodLabel(selectedInvoice.payment_method)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Reference</span>
                    <span className="font-medium text-forest-900">{selectedInvoice.payment_reference ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-forest-700/70">Paid At</span>
                    <span className="font-medium text-forest-900">{formatDateShort(selectedInvoice.paid_at)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => printInvoiceAsPdf(selectedInvoice)}
                    className="px-4 py-2 rounded-xl border border-earth-200 text-forest-800 hover:bg-earth-50 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
