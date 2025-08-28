import React from 'react';
import type { UserSession } from '@/types/user.types';


interface BookingHistoryProps {
  sessions: UserSession[];
  onReviewSession: (session: UserSession) => void;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({ sessions, onReviewSession }) => {
  const formatDateTime = (date: string, startTime: string) => {
    try {
      // Create a proper date string by combining date and time
      const dateTimeString = `${date}T${startTime}`;
      const sessionDate = new Date(dateTimeString);
      
      // Check if the date is valid
      if (isNaN(sessionDate.getTime())) {
        console.error('Invalid date/time:', { date, startTime, dateTimeString });
        return 'Invalid Date';
      }
      
      return sessionDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }) + ' at ' + sessionDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting date/time:', error, { date, startTime });
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatReviewDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No completed sessions</h3>
        <p className="text-gray-600 mb-6">
          Completed sessions and past sessions will appear here. 
          <br />
          Check "Upcoming Sessions" for your scheduled sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => (
        <div
          key={session.booking.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                             <div className="flex-1">
                   <div className="flex items-start space-x-4">
                     <div className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                       👤
                     </div>
                     <div className="flex-1">
                       <div className="flex items-center space-x-2 mb-2">
                         <h3 className="text-lg font-semibold text-gray-900">
                           Anonymous Listener
                         </h3>
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           ✅ Completed
                         </span>
                       </div>
                                     <p className="text-gray-600 mb-2">
                     {formatDateTime(session.booking.date, session.booking.startTime)}
                   </p>
                                     <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                     <span>Duration: 1 hour</span>
                     <span>Price: {formatCurrency(session.booking.price)}</span>
                     <span>Transaction: {session.booking.transactionId}</span>
                   </div>
                  
                  {/* Review Section */}
                  {session.review ? (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-semibold text-green-800">⭐ Your Review</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(session.review.rating)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatReviewDate(session.review.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3 bg-white rounded p-3 border-l-4 border-green-400">
                        "{session.review.review}"
                      </p>
                      <div className="flex items-center justify-between">
                        {session.review.isAnonymous && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🔒 Anonymous Review
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          Thank you for your feedback!
                        </span>
                      </div>
                    </div>
                  ) : session.canReview ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg">⭐</span>
                            <p className="text-sm font-semibold text-yellow-800">
                              Rate & Review Your Session
                            </p>
                          </div>
                          <p className="text-sm text-yellow-700">
                            Share your experience and help other users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-600">Quick Rating:</span>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => onReviewSession(session)}
                                className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors"
                              >
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => onReviewSession(session)}
                          className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 transition-colors"
                        >
                          Write Full Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">⏰</span>
                        <p className="text-sm text-gray-600">
                          Review period has expired for this session
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
                         <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
               {session.canReview && (
                 <button
                   onClick={() => onReviewSession(session)}
                   className="px-4 py-2 text-sm font-medium text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md hover:bg-yellow-200 transition-colors"
                 >
                   Write Review
                 </button>
               )}
               {session.review && (
                 <button
                   onClick={() => onReviewSession(session)}
                   className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-md hover:bg-blue-200 transition-colors"
                 >
                   Edit Review
                 </button>
               )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
