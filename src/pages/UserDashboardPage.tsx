import React, { useState } from 'react';
import { useUserDashboard } from '@/hooks/useUserDashboard';
import { UserStats } from '@/components/user/UserStats';
import { UpcomingSessions } from '@/components/user/UpcomingSessions';
import { BookingHistory } from '@/components/user/BookingHistory';
import { ReviewModal } from '@/components/user/ReviewModal';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import type { UserSession } from '@/types/user.types';

export const UserDashboardPage: React.FC = () => {
  const {
    stats,
    loading,
    error,
    upcomingSessions,
    completedSessions,
    sessionsNeedingReview,
    cancelBooking,
    createReview,
    updateReview,
  } = useUserDashboard();

  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  const handleReviewSession = (session: UserSession) => {
    setSelectedSession(session);
    setShowReviewModal(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
      } catch (error) {
        console.error('Failed to cancel booking:', error);
      }
    }
  };

  const handleSubmitReview = async (rating: number, review: string, isAnonymous: boolean) => {
    if (!selectedSession) return;

    try {
      if (selectedSession.review) {
        // Update existing review
        await updateReview(selectedSession.review.id, {
          rating,
          review,
          isAnonymous,
        });
      } else {
        // Create new review
        await createReview({
          bookingId: selectedSession.booking.id,
          userId: selectedSession.booking.userId,
          listenerId: selectedSession.booking.listenerId,
          rating,
          review,
          isAnonymous,
        });
      }
      setShowReviewModal(false);
      setSelectedSession(null);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm text-gray-600">
                  Welcome to your anonymous dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Simple redirect to home page
                  window.location.href = '/';
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                🎧 Book New Session
              </button>
              <button
                onClick={() => {
                  // Simple redirect to home page
                  window.location.href = '/';
                }}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                ← Back to Main Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && <UserStats stats={stats} className="mb-8" />}

        {/* Review Notifications */}
        {sessionsNeedingReview.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  {sessionsNeedingReview.length} session{sessionsNeedingReview.length !== 1 ? 's' : ''} waiting for your review
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Help other users by sharing your experience with the listeners.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming Sessions ({upcomingSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Booking History ({completedSessions.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'upcoming' ? (
          <UpcomingSessions
            sessions={upcomingSessions}
            onCancelBooking={handleCancelBooking}
          />
        ) : (
          <BookingHistory
            sessions={completedSessions}
            onReviewSession={handleReviewSession}
          />
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedSession && (
        <ReviewModal
          session={selectedSession}
          onSubmit={handleSubmitReview}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
};
