import { useState } from 'react';
import { Star, MessageSquare, Send } from 'lucide-react';
import { useToast } from '../components/ToastContext';

const reviews = [
  {
    id: 1,
    room: 'Garden Retreat',
    date: 'August 15, 2023',
    rating: 5,
    comment: 'Absolutely wonderful stay. The garden access was perfect for our morning coffee. The staff was incredibly attentive and the room was spotless.',
  },
  {
    id: 2,
    room: 'Forest Suite',
    date: 'March 10, 2023',
    rating: 4,
    comment: 'Great views and very peaceful. The bed was extremely comfortable. Only giving 4 stars because the Wi-Fi was a bit spotty in our specific room.',
  }
];

export default function Feedback() {
  const { showToast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating || !comment) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showToast("Thank you for your feedback!", "success");
    setRating(0);
    setComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-forest-900">Feedback & Ratings</h1>
        <p className="text-forest-700/70 mt-1">Share your experience to help us improve.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leave a Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100 sticky top-6">
            <h2 className="text-lg font-semibold text-forest-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-earth-600" />
              Leave a Review
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-forest-800 block mb-2">Select Recent Stay</label>
                <select className="w-full px-4 py-2.5 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent appearance-none text-sm">
                  <option>Forest Suite (Nov 15 - Nov 18)</option>
                  <option>Garden Retreat (Aug 10 - Aug 12)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-forest-800 block mb-2">Overall Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating) 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-earth-200'
                        } transition-colors`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-forest-800 block mb-2">Your Comments</label>
                <textarea 
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your stay..."
                  className="w-full px-4 py-3 rounded-xl border border-earth-200 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 outline-none transition-all bg-transparent text-sm resize-none"
                ></textarea>
              </div>

              <button 
                onClick={handleSubmit}
                className="w-full bg-forest-700 hover:bg-forest-800 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!rating || !comment || isSubmitting}
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

        {/* Past Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-forest-900">Your Past Reviews</h2>
          
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-earth-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-forest-900">{review.room}</h3>
                    <p className="text-xs text-forest-700/50 mt-1">{review.date}</p>
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
        </div>
      </div>
    </div>
  );
}
