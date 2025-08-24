import React, { useState, useEffect } from 'react';
import type { UserSession } from '@/types/user.types';

interface UpcomingSessionsProps {
  sessions: UserSession[];
  onCancelBooking: (bookingId: string) => Promise<void>;
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({ sessions, onCancelBooking }) => {
  const [timeUntilSessions, setTimeUntilSessions] = useState<Record<string, number>>({});

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const newTimeUntil: Record<string, number> = {};

      sessions.forEach(session => {
        const sessionTime = new Date(session.booking.startTime).getTime();
        const timeDiff = sessionTime - now;
        
        if (timeDiff > 0) {
          newTimeUntil[session.booking.id] = Math.floor(timeDiff / (1000 * 60)); // minutes
        } else {
          newTimeUntil[session.booking.id] = 0;
        }
      });

      setTimeUntilSessions(newTimeUntil);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [sessions]);

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hours ${remainingMinutes} minutes`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const remainingMinutes = minutes % 60;
      return `${days} days ${hours} hours ${remainingMinutes} minutes`;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
        <p className="text-gray-600 mb-6">You don't have any upcoming sessions scheduled.</p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Book a Session
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const timeUntil = timeUntilSessions[session.booking.id] || 0;
        const isSoon = timeUntil < 60; // Less than 1 hour
        const isToday = timeUntil < 1440; // Less than 24 hours

        return (
          <div
            key={session.booking.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
              isSoon ? 'border-yellow-300 bg-yellow-50' : ''
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
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
                       {isSoon && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                           ⏰ Soon
                         </span>
                       )}
                     </div>
                                         <p className="text-gray-600 mb-2">
                       {formatDateTime(session.booking.date, session.booking.startTime)}
                     </p>
                                         <div className="flex items-center space-x-4 text-sm text-gray-500">
                       <span>Duration: 1 hour</span>
                       <span>Price: {formatCurrency(session.booking.price)}</span>
                       <span>Transaction: {session.booking.transactionId}</span>
                     </div>
                  </div>
                </div>
              </div>
              
                             <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                 {session.canCancel && (
                   <button
                     onClick={() => onCancelBooking(session.booking.id)}
                     className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 transition-colors"
                   >
                     Cancel Session
                   </button>
                 )}
                 {timeUntil <= 0 ? (
                   <button
                     onClick={() => window.open(`/session/${session.booking.id}`, '_blank')}
                     className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 transition-colors"
                   >
                     Join Session
                   </button>
                 ) : (
                   <button
                     disabled
                     className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed opacity-60"
                   >
                     Join Session
                   </button>
                 )}
                 {timeUntil > 0 && (
                   <div className="text-center mt-2">
                     <p className="text-sm text-gray-600">
                       Session will start in <span className="font-medium text-blue-600">{formatTimeUntil(timeUntil)}</span>
                     </p>
                     <p className="text-xs text-gray-500 mt-1">
                       Button will become active when session time is reached
                     </p>
                   </div>
                 )}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
