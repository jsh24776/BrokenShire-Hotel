import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendation?: null | {
    room_type: string;
    fit_score?: number | null;
    estimated_nights?: number | null;
    estimated_per_night_php?: number | null;
    estimated_total_php?: number | null;
    why?: string[] | null;
    tradeoffs?: string[] | null;
  };
};

function peso(n?: number | null) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '—';
  return `₱${Number(n).toLocaleString('en-PH')}`;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function HelpChatbot() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  const [budget, setBudget] = useState<string>('');
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState<string>('2');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: 'assistant',
      content:
        'Hi! I’m your Brokenshire AI concierge. Tell me your budget, dates, and what you like (ex: forest view, breakfast, jacuzzi) and I’ll suggest the best room.',
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await api.get('/profile', { signal: controller.signal });
        setProfileName(res.data?.user?.name ?? null);
      } catch {
        // ignore
      }
    })();
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages.length, isSending]);

  const history = useMemo(() => {
    const trimmed = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));
    return trimmed;
  }, [messages]);

  const send = async () => {
    const msg = input.trim();
    if (!msg) return;
    if (isSending) return;

    setInput('');
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);

    setIsSending(true);
    try {
      const payload: any = {
        message: msg,
        history,
      };

      const b = budget.trim() === '' ? null : Number(budget);
      if (b !== null && !Number.isNaN(b)) payload.budget_pesos = b;
      if (dates.checkIn) payload.check_in_date = dates.checkIn;
      if (dates.checkOut) payload.check_out_date = dates.checkOut;
      const g = Number(guests);
      if (!Number.isNaN(g) && g > 0) payload.guests = g;

      const res = await api.post('/chat', payload);

      const reply = String(res.data?.reply ?? '').trim() || 'Sorry, I could not generate a response.';
      const recommendation = res.data?.recommendation ?? null;

      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: reply,
          recommendation,
        },
      ]);
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        'Failed to contact AI assistant.';
      showToast(String(message), 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: 'Sorry — I couldn’t reach the AI assistant. Please try again.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const goToSearch = (roomType?: string) => {
    const params = new URLSearchParams();
    if (roomType) params.set('type', roomType);
    if (dates.checkIn) params.set('checkIn', dates.checkIn);
    if (dates.checkOut) params.set('checkOut', dates.checkOut);
    if (guests) params.set('guests', guests);
    navigate(`/user/search?${params.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-forest-700 hover:bg-forest-800 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 border border-forest-800/20"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium text-sm">AI Help</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-forest-900/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-[420px] max-w-[420px] bg-white rounded-2xl shadow-2xl border border-earth-200 overflow-hidden"
              role="dialog"
              aria-modal="true"
            >
              <div className="p-4 border-b border-earth-100 bg-earth-50/60 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-forest-100 border border-forest-200 flex items-center justify-center text-forest-700">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-forest-900 flex items-center gap-2">
                      Brokenshire AI Concierge
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-xs text-forest-700/70 mt-0.5">
                      {profileName ? `Welcome, ${profileName}.` : 'Ask anything about your booking.'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-forest-800/60 hover:text-forest-900 p-2 rounded-xl hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-earth-100 grid grid-cols-3 gap-2 bg-white">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-forest-700/60">Budget</label>
                  <div className="mt-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-700/60 text-sm">₱</span>
                    <input
                      value={budget}
                      onChange={(e) => setBudget(e.target.value.replace(/[^\d.]/g, ''))}
                      placeholder="e.g. 5000"
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-earth-200 text-sm text-forest-900 outline-none focus:border-forest-500"
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-forest-700/60">Check-in</label>
                  <input
                    type="date"
                    value={dates.checkIn}
                    onChange={(e) => setDates((p) => ({ ...p, checkIn: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-earth-200 text-sm text-forest-900 outline-none focus:border-forest-500"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-forest-700/60">Check-out</label>
                  <input
                    type="date"
                    value={dates.checkOut}
                    onChange={(e) => setDates((p) => ({ ...p, checkOut: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-earth-200 text-sm text-forest-900 outline-none focus:border-forest-500"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-forest-700/60">Guests</label>
                  <input
                    value={guests}
                    onChange={(e) => setGuests(e.target.value.replace(/[^\d]/g, ''))}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-earth-200 text-sm text-forest-900 outline-none focus:border-forest-500"
                    placeholder="2"
                  />
                </div>
              </div>

              <div ref={scrollRef} className="max-h-[360px] overflow-auto p-4 space-y-3 bg-earth-50/30">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm border ${
                        m.role === 'user'
                          ? 'bg-forest-700 text-white border-forest-800/20'
                          : 'bg-white text-forest-900 border-earth-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

                      {m.role === 'assistant' && m.recommendation && (
                        <div className="mt-3 bg-earth-50 border border-earth-200 rounded-xl p-3">
                          <div className="text-xs font-bold uppercase tracking-widest text-forest-700/60">Recommended</div>
                          <div className="mt-1 font-semibold text-forest-900">{m.recommendation.room_type}</div>
                          <div className="mt-1 text-xs text-forest-800/70">
                            {m.recommendation.estimated_total_php != null && (
                              <span>
                                Est. total: <span className="font-semibold">{peso(m.recommendation.estimated_total_php)}</span>
                              </span>
                            )}
                            {m.recommendation.estimated_per_night_php != null && (
                              <span className="ml-2">
                                • Per night: <span className="font-semibold">{peso(m.recommendation.estimated_per_night_php)}</span>
                              </span>
                            )}
                          </div>

                          {Array.isArray(m.recommendation.why) && m.recommendation.why.length > 0 && (
                            <ul className="mt-2 text-xs text-forest-800/80 list-disc pl-4 space-y-1">
                              {m.recommendation.why.slice(0, 3).map((w, idx) => (
                                <li key={idx}>{w}</li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => goToSearch(m.recommendation?.room_type)}
                              className="flex-1 bg-forest-700 hover:bg-forest-800 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
                            >
                              Search & Book
                            </button>
                            <button
                              type="button"
                              onClick={() => goToSearch()}
                              className="px-3 py-2 rounded-xl text-xs font-medium border border-earth-200 text-forest-800 hover:bg-white transition-colors"
                            >
                              View rooms
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-white text-forest-900 border border-earth-200 rounded-2xl px-4 py-3 text-sm">
                      Thinking…
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-earth-100 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                    placeholder="Type your question…"
                    className="flex-1 resize-none min-h-[44px] max-h-28 px-4 py-3 rounded-2xl border border-earth-200 outline-none focus:border-forest-500 text-sm text-forest-900"
                  />
                  <button
                    type="button"
                    disabled={isSending || input.trim() === ''}
                    onClick={() => void send()}
                    className="bg-forest-700 disabled:bg-forest-700/50 hover:bg-forest-800 text-white rounded-2xl px-4 py-3 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:block">Send</span>
                  </button>
                </div>

                <div className="mt-2 text-[11px] text-forest-700/60">
                  Tip: Try “I want a quiet room with breakfast under ₱5,000 for 2 nights.”
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

