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
        try {
          // Combine date and time for proper calculation
          const dateTimeString = `${session.booking.date}T${session.booking.startTime}`;
          const sessionTime = new Date(dateTimeString).getTime();
          
          // Check if the date is valid
          if (isNaN(sessionTime)) {
            console.error('Invalid session time:', { date: session.booking.date, time: session.booking.startTime });
            newTimeUntil[session.booking.id] = 0;
            return;
          }
          
          const timeDiff = sessionTime - now;
          
          if (timeDiff > 0) {
            newTimeUntil[session.booking.id] = Math.floor(timeDiff / (1000 * 60)); // minutes
          } else {
            newTimeUntil[session.booking.id] = 0;
          }
        } catch (error) {
          console.error('Error calculating time until session:', error);
          newTimeUntil[session.booking.id] = 0;
        }
      });

      setTimeUntilSessions(newTimeUntil);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 30000); // Update every 30 seconds for better UX

    return () => clearInterval(interval);
  }, [sessions]);

  const formatTimeUntil = (minutes: number) => {
    if (minutes <= 0) {
      return 'Session is ready to start!';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      const remainingMinutes = minutes % 60;
      
      let result = `${days} day${days !== 1 ? 's' : ''}`;
      if (hours > 0) {
        result += ` ${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      if (remainingMinutes > 0) {
        result += ` ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
      }
      return result;
    }
  };

  const formatDateTime = (date: string, startTime: string) => {
    try {
      console.log('🔍 DEBUG - Formatting date/time:', { date, startTime });
      
      // Handle different date formats
      let sessionDate: Date;
      
      if (date && startTime) {
        // Try combining date and time
        const dateTimeString = `${date}T${startTime}`;
        sessionDate = new Date(dateTimeString);
        
        // If that fails, try parsing date separately
        if (isNaN(sessionDate.getTime())) {
          sessionDate = new Date(date);
        }
      } else if (date) {
        // Only date available
        sessionDate = new Date(date);
      } else {
        console.error('No date or startTime provided');
        return 'Date not available';
      }
      
      // Check if the date is valid
      if (isNaN(sessionDate.getTime())) {
        console.error('Invalid date/time:', { date, startTime });
        return 'Invalid Date';
      }
      
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
    } catch (error) {
      console.error('Error formatting date/time:', error, { date, startTime });
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    // Handle NaN or invalid amounts
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      if (!startTime || !endTime) {
        return '1 hour'; // Default fallback
      }
      
      // Parse times (assuming HH:MM format)
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      
      // Handle overnight sessions
      if (durationMinutes <= 0) {
        durationMinutes += 24 * 60; // Add 24 hours
      }
      
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      if (hours === 1 && minutes === 0) {
        return '1 hour';
      } else if (hours > 0 && minutes > 0) {
        return `${hours} hours ${minutes} minutes`;
      } else if (hours > 0) {
        return `${hours} hours`;
      } else {
        return `${minutes} minutes`;
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '1 hour'; // Default fallback
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming sessions</h3>
        <p className="text-gray-600 mb-6">
          You don't have any upcoming sessions scheduled.
          <br />
          Check "Booking History" for your past and completed sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => {
        const timeUntil = timeUntilSessions[session.booking.id] || 0;
        const isSoon = timeUntil < 60; // Less than 1 hour

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
                       {timeUntil > 0 && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                           ⏰ {formatTimeUntil(timeUntil)}
                         </span>
                       )}
                       {timeUntil <= 0 && (
                         <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                           🟢 Ready to Join
                         </span>
                       )}
                     </div>
                                         <p className="text-gray-600 mb-2">
                       {formatDateTime(session.booking.date, session.booking.startTime)}
                     </p>
                                         <div className="flex items-center space-x-4 text-sm text-gray-500">
                       <span>Duration: {calculateDuration(session.booking.startTime, session.booking.endTime)}</span>
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
                     onClick={() => {
                       // Open meeting link if available
                       if (session.booking.meetingLink) {
                         window.open(session.booking.meetingLink, '_blank');
                       } else {
                         alert('Meeting link not available. Please contact support.');
                       }
                     }}
                     className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-md hover:bg-green-700 transition-colors"
                   >
                     🎥 Join Session
                   </button>
                 ) : (
                   <button
                     disabled
                     className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed opacity-60"
                   >
                     ⏳ Join Session
                   </button>
                 )}
                 {timeUntil > 0 && (
                   <div className="text-center mt-2">
                     <p className="text-sm text-gray-600">
                       Your session will start in <span className="font-medium text-blue-600">{formatTimeUntil(timeUntil)}</span>
                     </p>
                     <p className="text-xs text-gray-500 mt-1">
                       Meeting link will be available when session begins
                     </p>
                   </div>
                 )}
                 {timeUntil <= 0 && session.booking.meetingLink && (
                   <div className="text-center mt-2">
                     <p className="text-xs text-green-600 font-medium">
                       ✅ Session is ready! Click to join your meeting.
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
