import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Star, MessageSquare, Send } from 'lucide-react';
import { useToast } from '../components/ToastContext';
import { api } from '../lib/api';

type Booking = {
  id: number;
  reference: string;
  room_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
};

type Feedback = {
  id: number;
  reservation_id: number;
  reservation_ref: string;
  room_name: string;
  room_number: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  rating: number;
  comment: string;
  created_at: string | null;
};

function formatDateShort(value: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: '2-digit', year: 'numeric' }).format(d);
}

export default function Feedback() {
  const { showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ reservation?: string; rating?: string } | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async (signal?: AbortSignal) => {
    setError(null);
    const [bookingsRes, feedbackRes] = await Promise.all([
      api.get('/bookings', { signal }),
      api.get('/feedbacks', { signal }),
    ]);

    const b = Array.isArray(bookingsRes.data?.bookings) ? (bookingsRes.data.bookings as Booking[]) : [];
    const f = Array.isArray(feedbackRes.data?.feedbacks) ? (feedbackRes.data.feedbacks as Feedback[]) : [];
    setBookings(b);
    setFeedbacks(f);
  };

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    (async () => {
      try {
        await fetchData(controller.signal);
      } catch (err) {
        if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
        const message =
          (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
          'Failed to load feedback.';
        setError(String(message));
      } finally {
        setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const completedStays = useMemo(() => {
    const completed = new Set(['checked_out', 'completed', 'complete', 'done']);
    return bookings.filter((b) => completed.has(String(b.status ?? '').toLowerCase()));
  }, [bookings]);
  const reviewedReservationIds = useMemo(() => new Set(feedbacks.map((f) => f.reservation_id)), [feedbacks]);
  const hasUnreviewedCompleted = useMemo(
    () => completedStays.some((b) => !reviewedReservationIds.has(b.id)),
    [completedStays, reviewedReservationIds]
  );

  useEffect(() => {
    if (reservationId) return;
    const first = completedStays.find((b) => !reviewedReservationIds.has(b.id)) ?? completedStays[0];
    if (first) setReservationId(first.id);
  }, [reservationId, completedStays, reviewedReservationIds]);

  const handleSubmit = async () => {
    const nextErrors: { reservation?: string; rating?: string } = {};
    if (!reservationId) nextErrors.reservation = 'Please select a completed stay.';
    if (!rating) nextErrors.rating = 'Please select a rating.';
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      showToast('Please complete the required fields.', 'error');
      return;
    }

    if (reviewedReservationIds.has(reservationId)) {
      showToast('You already reviewed this stay.', 'info');
      return;
    }

    setFieldErrors(null);

    setIsSubmitting(true);
    try {
      await api.post('/feedbacks', {
        reservation_id: reservationId,
        rating,
        comment: comment.trim(),
      });
      showToast('Thank you for your feedback!', 'success');
      setRating(0);
      setHoveredRating(0);
      setComment('');
      setReservationId(null);
      await fetchData();
    } catch (err) {
      const message =
        (axios.isAxiosError(err) ? (err.response?.data as any)?.message : null) ??
        Object.values(((axios.isAxiosError(err) ? (err.response?.data as any)?.errors : {}) ?? {}) as Record<
          string,
          string[]
        >)[0]?.[0] ??
        'Failed to submit feedback.';
      showToast(String(message), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Feedback & Ratings</h1>
        <p className="text-forest-700/70 mt-1">Share your experience to help us improve.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-forest-700/70">
          Loading feedback...
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-sm border border-earth-100 p-12 text-center text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 sticky top-6">
              <h2 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-earth-600" />
                Leave a Review
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-forest-800 block mb-2">Select Completed Stay</label>
                  <select
                    value={reservationId ?? ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      setReservationId(value);
                      setFieldErrors((prev) => (prev?.reservation ? { ...prev, reservation: undefined } : prev));
                    }}
                    disabled={completedStays.length === 0}
                    className={`w-full px-4 py-2.5 rounded-xl border focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent appearance-none text-sm disabled:bg-earth-50 ${
                      fieldErrors?.reservation ? 'border-red-300 ring-2 ring-red-500/10' : 'border-earth-200'
                    }`}
                  >
                    {completedStays.length === 0 ? (
                      <option value="">No completed stays available</option>
                    ) : (
                      <>
                        <option value="">Select a stay</option>
                        {completedStays.map((b) => (
                          <option key={b.id} value={b.id} disabled={reviewedReservationIds.has(b.id)}>
                            {b.room_name} ({formatDateShort(b.check_in_date)} - {formatDateShort(b.check_out_date)})
                            {reviewedReservationIds.has(b.id) ? ' — Reviewed' : ''}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {fieldErrors?.reservation && <p className="text-xs text-red-600 mt-2">{fieldErrors.reservation}</p>}
                  {completedStays.length === 0 && (
                    <p className="text-xs text-forest-700/60 mt-2">You can submit feedback after you check out.</p>
                  )}
                  {completedStays.length > 0 && !hasUnreviewedCompleted && (
                    <p className="text-xs text-forest-700/60 mt-2">You already reviewed all completed stays.</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-forest-800 block mb-2">Overall Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          setFieldErrors((prev) => (prev?.rating ? { ...prev, rating: undefined } : prev));
                        }}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoveredRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-earth-200'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {fieldErrors?.rating && <p className="text-xs text-red-600 mt-2">{fieldErrors.rating}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-forest-800 block mb-2">Your Comments</label>
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    placeholder="Tell us about your stay..."
                    className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent text-sm resize-none"
                  />
                  <div className="mt-2 text-xs text-forest-700/60 text-right">{comment.length}/500</div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting || completedStays.length === 0 || !hasUnreviewedCompleted}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-forest-900">Your Past Reviews</h2>

            {feedbacks.length === 0 ? (
              <div className="bg-white p-10 rounded-2xl shadow-sm border border-earth-100 text-center text-forest-700/70">
                No reviews yet.
              </div>
            ) : (
              <div className="space-y-4">
                {feedbacks.map((review) => (
                  <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div>
                        <h3 className="font-medium text-forest-900">{review.room_name}</h3>
                        <p className="text-xs text-forest-700/50 mt-1">
                          {review.check_in_date && review.check_out_date
                            ? `${formatDateShort(review.check_in_date)} → ${formatDateShort(review.check_out_date)}`
                            : review.reservation_ref}{' '}
                          • {formatDateShort(review.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-earth-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-forest-700/80 leading-relaxed bg-earth-50/50 p-4 rounded-xl border border-earth-100/50">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
