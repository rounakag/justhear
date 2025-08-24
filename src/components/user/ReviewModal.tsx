import React, { useState } from 'react';
import { Dialog } from '@radix-ui/react-dialog';
import type { UserSession } from '@/types/user.types';

interface ReviewModalProps {
  session: UserSession;
  onSubmit: (rating: number, review: string, isAnonymous: boolean) => Promise<void>;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ session, onSubmit, onClose }) => {
  const [rating, setRating] = useState(session.review?.rating || 5);
  const [review, setReview] = useState(session.review?.review || '');
  const [isAnonymous, setIsAnonymous] = useState(session.review?.isAnonymous || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!review.trim()) {
      setError('Please write a review');
      return;
    }

    if (review.length < 10) {
      setError('Review must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(rating, review.trim(), isAnonymous);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (date: string, startTime: string) => {
    const sessionDate = new Date(startTime);
    return sessionDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' at ' + sessionDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderStars = (currentRating: number, interactive = true) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && setRating(star)}
            className={`w-8 h-8 ${
              star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-300 transition-colors' : ''}`}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {rating} out of 5 stars
        </span>
      </div>
    );
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                             <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                 {session.review ? 'Edit Your Review' : 'Review Your Session'}
               </Dialog.Title>

              {/* Session Info */}
                             <div className="bg-gray-50 rounded-lg p-4 mb-6">
                 <div className="flex items-center space-x-3 mb-3">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                     👤
                   </div>
                   <div>
                     <h3 className="font-medium text-gray-900">
                       Anonymous Listener
                     </h3>
                     <p className="text-sm text-gray-600">
                       {formatDateTime(session.booking.date, session.booking.startTime)}
                     </p>
                   </div>
                 </div>
                
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you rate your session?
                  </label>
                  {renderStars(rating, true)}
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                    Share your experience (minimum 10 characters)
                  </label>
                  <textarea
                    id="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell us about your session experience..."
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {review.length}/500 characters
                  </p>
                </div>

                {/* Anonymous Option */}
                <div className="flex items-center">
                  <input
                    id="anonymous"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    disabled={isSubmitting}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                    Submit review anonymously
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                                     <button
                     type="submit"
                     disabled={isSubmitting || !review.trim() || review.length < 10}
                     className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isSubmitting ? 'Submitting...' : (session.review ? 'Update Review' : 'Submit Review')}
                   </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
