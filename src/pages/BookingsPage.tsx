import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button/button';

// Global function to trigger dashboard refresh
export const triggerDashboardRefresh = () => {
  window.dispatchEvent(new CustomEvent('refresh-dashboard'));
};

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  listener_id: string;
  listener?: {
    username: string;
  };
}

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/bookings');
      return;
    }
  }, [user, navigate]);

  // Fetch available slots
  useEffect(() => {
    if (user) {
      fetchAvailableSlots();
    }
  }, [user]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      console.log('🔍 DEBUG - Fetching available slots for booking...');
      
      const apiUrl = 'https://justhear-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/slots/available`);
      
      console.log('🔍 DEBUG - Available slots response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(`Failed to fetch slots: ${errorMessage}`);
      }
      
      const data = await response.json();
      console.log('🔍 DEBUG - Available slots data:', data);
      
      if (data.slots && Array.isArray(data.slots)) {
        setAvailableSlots(data.slots as TimeSlot[]);
        console.log('🔍 DEBUG - Set available slots:', data.slots.length, 'slots');
      } else {
        console.log('🔍 DEBUG - No slots found in response:', data);
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('❌ ERROR fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dates for next 10 days and filter to only show dates with available slots
  const today = new Date();
  const allDates = Array.from({ length: 10 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      value: dateStr,
    };
  });

  // Filter to only show dates that have available slots
  const datesWithSlots = allDates.filter(date => {
    const slotsForDate = availableSlots.filter(slot => 
      slot.date === date.value && slot.status === 'available'
    );
    return slotsForDate.length > 0;
  });

  // Get available times for selected date
  const getAvailableTimesForDate = (date: string): string[] => {
    return availableSlots
      .filter(slot => slot.date === date && slot.status === 'available')
      .map(slot => slot.start_time);
  };

  const times = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !user) return;
    
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }

    try {
      // Find the selected slot
      const selectedSlot = availableSlots.find(slot => 
        slot.date === selectedDate && slot.start_time === selectedTime
      );

      if (!selectedSlot) {
        alert('Selected slot is no longer available. Please choose another slot.');
        return;
      }

      // Create booking
      const response = await fetch('https://justhear-backend.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          userId: user.id,
          slotId: selectedSlot.id
        })
      });

      if (response.ok) {
        await response.json(); // Consume the response
        alert(`✅ Booking confirmed!\n\nDate: ${datesWithSlots.find(d => d.value === selectedDate)?.label}\nTime: ${selectedTime}\nAmount: ₹49\n\nYou will receive a confirmation call 5 minutes before your session.`);
        
        // Reset form and refresh slots
        setSelectedDate(null);
        setSelectedTime(null);
        setTermsAccepted(false);
        await fetchAvailableSlots(); // Refresh available slots
        
        // Trigger dashboard refresh to show the new booking
        triggerDashboardRefresh();
      } else {
        const errorData = await response.json();
        alert(`❌ Booking failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('❌ Booking failed. Please try again.');
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    handleBooking();
  };

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              JustHear
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.username}</span>
              <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Session</h1>
          <p className="text-gray-600">Choose your preferred date and time for your listening session</p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading available slots...</p>
          </div>
        ) : datesWithSlots.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">All Slots Booked</h3>
            <p className="text-gray-600 mb-4">
              We're currently fully booked for the next 10 days.
            </p>
            <p className="text-sm text-gray-500">
              Please check again tomorrow. We update slots every day with new availability.
            </p>
            <div className="mt-6">
              <button
                onClick={fetchAvailableSlots}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Availability
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Date Selection */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-gray-800">Select Date</h3>
              <div className="grid grid-cols-7 gap-3">
                {datesWithSlots.map((date) => (
                  <button
                    key={date.value}
                    onClick={() => {
                      setSelectedDate(date.value);
                      setSelectedTime(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedDate === date.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-medium">{date.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-gray-800">
                  Select Time for {datesWithSlots.find(d => d.value === selectedDate)?.label}
                </h3>
                {times.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {times.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedTime === time
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No available slots for this date</p>
                    <p className="text-sm mt-2">Please select another date or check back later</p>
                  </div>
                )}
              </div>
            )}

            {/* Booking Button */}
            {selectedDate && selectedTime && (
              <div className="text-center">
                <Button
                  onClick={handleBooking}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
                >
                  Book Session - ₹49
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  You will receive a confirmation call 5 minutes before your session
                </p>
              </div>
            )}
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Terms & Conditions</h3>
            <div className="text-sm text-gray-600 mb-6 space-y-2">
              <p>• Sessions are anonymous and confidential</p>
              <p>• No recordings or transcripts are kept</p>
              <p>• Sessions are for emotional support only</p>
              <p>• Payment is non-refundable once session starts</p>
              <p>• You can cancel up to 1 hour before your session</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowTerms(false)}
                className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptTerms}
                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
              >
                Accept & Book
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
