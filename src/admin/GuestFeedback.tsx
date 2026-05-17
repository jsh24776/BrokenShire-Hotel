import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ThumbsUp, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
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
import { api } from '../lib/api';

// ─── Mock chart data (kept as mock per requirements) ────────────────────────
const feedbackData = [
  { month: 'Jan', rating5: 45, rating4: 30, rating3: 15, rating2: 8, rating1: 2 },
  { month: 'Feb', rating5: 38, rating4: 28, rating3: 18, rating2: 12, rating1: 4 },
  { month: 'Mar', rating5: 52, rating4: 32, rating3: 12, rating2: 3, rating1: 1 },
  { month: 'Apr', rating5: 58, rating4: 35, rating3: 10, rating2: 2, rating1: 0 },
  { month: 'May', rating5: 68, rating4: 40, rating3: 8, rating2: 1, rating1: 0 },
  { month: 'Jun', rating5: 75, rating4: 42, rating3: 6, rating2: 1, rating1: 0 },
];

// ─── Types ───────────────────────────────────────────────────────────────────
interface ReviewItem {
  id: number;
  guest_name: string;
  rating: number;
  comment: string;
  created_at: string;
  room_name: string;
  room_number: string | null;
}

interface FeedbackStats {
  total_reviews: number;
  avg_rating: number;
  satisfaction_score: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const totalReviewsMock = feedbackData.reduce(
  (sum, item) => sum + item.rating5 + item.rating4 + item.rating3 + item.rating2 + item.rating1,
  0
);

const avgRatingMock = (
  feedbackData.reduce(
    (sum, item) =>
      sum +
      item.rating5 * 5 +
      item.rating4 * 4 +
      item.rating3 * 3 +
      item.rating2 * 2 +
      item.rating1 * 1,
    0
  ) / totalReviewsMock
).toFixed(1);

const satisfactionScoreMock = (
  (feedbackData.reduce((sum, item) => sum + item.rating5 + item.rating4, 0) / totalReviewsMock) *
  100
).toFixed(1);

// ─── Component ───────────────────────────────────────────────────────────────
export default function GuestFeedback() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/admin/feedbacks');
        if (!cancelled) {
          setReviews(data.feedbacks ?? []);
          setStats(data.stats ?? null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ??
              'Failed to load guest reviews. Please try again.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFeedback();
    return () => { cancelled = true; };
  }, []);

  // Use real stats when available, fall back to mock chart stats
  const displayAvgRating = stats ? stats.avg_rating.toFixed(1) : avgRatingMock;
  const displayTotalReviews = stats ? stats.total_reviews : totalReviewsMock;
  const displaySatisfaction = stats ? stats.satisfaction_score.toFixed(1) : satisfactionScoreMock;

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
          <h1 className="text-2xl font-serif font-semibold text-forest-900">Guest Feedback</h1>
          <p className="text-forest-700/70 mt-1">Ratings, reviews, and satisfaction analysis.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Average Rating</p>
              <p className="text-3xl font-bold text-forest-900 mt-2">{displayAvgRating}</p>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(Number(displayAvgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-earth-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <Star className="w-6 h-6 fill-current" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Total Reviews</p>
              <p className="text-3xl font-bold text-forest-900 mt-2">{displayTotalReviews}</p>
              <p className="text-xs text-forest-700/60 mt-2">All-time feedback</p>
            </div>
            <div className="w-12 h-12 bg-forest-50 rounded-xl flex items-center justify-center text-forest-600">
              <MessageCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-forest-700/70">Satisfaction Score</p>
              <p className="text-3xl font-bold text-emerald-700 mt-2">{displaySatisfaction}%</p>
              <p className="text-xs text-forest-700/60 mt-2">4-5 star ratings</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <ThumbsUp className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution Chart (mock data) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
        <h3 className="text-lg font-semibold text-forest-900 mb-6">Rating Distribution (YTD)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feedbackData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2dcd1" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7a604e', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              <Bar dataKey="rating5" fill="#059669" name="5-star" />
              <Bar dataKey="rating4" fill="#84cc16" name="4-star" />
              <Bar dataKey="rating3" fill="#eab308" name="3-star" />
              <Bar dataKey="rating2" fill="#fb923c" name="2-star" />
              <Bar dataKey="rating1" fill="#ef4444" name="1-star" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Reviews — REAL DATA from database */}
      <div className="bg-white rounded-2xl shadow-sm border border-earth-100 overflow-hidden">
        <div className="p-6 border-b border-earth-100 bg-earth-50/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-forest-900">Recent Guest Reviews</h3>
          {!loading && !error && reviews.length > 0 && (
            <span className="text-xs text-forest-700/60 bg-earth-100 px-3 py-1 rounded-full">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-forest-700/60">
            <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
            <p className="text-sm">Loading guest reviews…</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-600/80">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                api.get('/admin/feedbacks')
                  .then(({ data }) => {
                    setReviews(data.feedbacks ?? []);
                    setStats(data.stats ?? null);
                  })
                  .catch((err) =>
                    setError(err?.response?.data?.message ?? 'Failed to load guest reviews.')
                  )
                  .finally(() => setLoading(false));
              }}
              className="text-xs text-forest-700 underline hover:text-forest-900 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-forest-700/50">
            <MessageCircle className="w-10 h-10" />
            <p className="text-sm font-medium">No reviews submitted yet.</p>
            <p className="text-xs">Guest reviews will appear here once submitted.</p>
          </div>
        )}

        {/* Reviews list */}
        {!loading && !error && reviews.length > 0 && (
          <div className="divide-y divide-earth-100">
            {reviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-earth-50/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-forest-900">{review.guest_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {review.room_name && (
                        <span className="text-xs text-forest-700/60 bg-earth-100 px-2 py-0.5 rounded-full">
                          {review.room_name}{review.room_number ? ` · Rm ${review.room_number}` : ''}
                        </span>
                      )}
                      <p className="text-xs text-forest-700/50">
                        {new Date(review.created_at).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-earth-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-forest-700 leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
