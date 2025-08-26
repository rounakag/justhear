import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth.tsx";
import { TermsAndConditions } from "./TermsAndConditions";
// Removed unused import: apiService

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

interface SchedulerModalProps {
  triggerClassName?: string;
  children?: React.ReactNode;
  onOpen?: () => void;
}

export function SchedulerModal({ triggerClassName, children, onOpen }: SchedulerModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    // Call the onOpen callback if provided
    if (onOpen) {
      onOpen();
    }
    
    if (!user) {
      // Trigger login modal - find AuthModal trigger and click it
      const authTrigger = document.querySelector('[data-auth-trigger]') as HTMLElement;
      if (authTrigger) {
        authTrigger.click();
      } else {
        alert("Please login to book a session");
      }
      return;
    }
    setOpen(true);
  };

  const today = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    return {
      label: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      value: dateStr,
    };
  });

  // Fetch available slots when modal opens
  useEffect(() => {
    if (open) {
      fetchAvailableSlots();
    }
  }, [open]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      console.log('🔍 DEBUG - Fetching available slots for users...');
      
      // Use direct API call with correct URL
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

  // Get available times for selected date
  const getAvailableTimesForDate = (date: string): string[] => {
    return availableSlots
      .filter(slot => slot.date === date && slot.status === 'available')
      .map(slot => slot.start_time);
  };

  const times = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;
    
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }
    
    alert(`Booking confirmed!\n\nDate: ${dates.find(d => d.value === selectedDate)?.label}\nTime: ${selectedTime}\nAmount: ₹49\n\nYou will receive a confirmation call 5 minutes before your session.`);
    
    setOpen(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setTermsAccepted(false);
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    handleBooking();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button 
            className={`rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 ${triggerClassName}`}
            size="lg"
            onClick={handleOpen}
          >
            🎧 Book Session
          </Button>
        )}
      </DialogTrigger>
      
      {user && (
        <DialogContent className="max-w-lg w-full p-0 max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl py-6 px-7 flex flex-col items-center">
            <DialogTitle className="text-xl font-bold">🎧 Book Your Session</DialogTitle>
            <p className="text-blue-100">Choose your preferred date and time</p>
          </div>
          
          <div className="p-6">
            {/* Date Selection */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Select Date</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dates.map((dt) => (
                  <Button
                    key={dt.value}
                    variant={selectedDate === dt.value ? "default" : "outline"}
                    onClick={() => {
                      setSelectedDate(dt.value);
                      setSelectedTime(null);
                    }}
                    className="rounded-lg text-xs p-2 h-auto"
                  >
                    <div className="text-center">
                      <div className="font-semibold">{dt.label.split(' ')[0]}</div>
                      <div className="text-xs opacity-80">{dt.label.split(' ').slice(1).join(' ')}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Time Slots */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 text-gray-800">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2">
                {loading ? (
                  <div className="col-span-3 text-center text-gray-500 py-4">
                    Loading available slots...
                  </div>
                ) : selectedDate ? (
                  times.length > 0 ? (
                    times.map((tm: string) => (
                      <Button
                        key={tm}
                        variant={selectedTime === tm ? "default" : "outline"}
                        onClick={() => setSelectedTime(tm)}
                        className="rounded-lg text-sm"
                      >
                        {tm}
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-3 text-center text-gray-500 py-4">
                      No slots available for this date
                    </div>
                  )
                ) : (
                  <div className="col-span-3 text-center text-gray-500 py-4">
                    Please select a date first
                  </div>
                )}
              </div>
            </div>
            
            {/* Core Guidelines - Always Visible */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-3">
              <h4 className="font-semibold text-blue-800 flex items-center">
                💬 Session Guidelines
              </h4>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Share feelings, emotions, and life experiences</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Seek validation and emotional support</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">❌</span>
                  <span><strong>No sexual content, explicit language, or inappropriate topics</strong></span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">❌</span>
                  <span><strong>No harassment, threats, or abusive behavior</strong></span>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-700 text-xs font-medium">
                  ⚠️ <strong>Inappropriate conversations will result in immediate call termination.</strong>
                </p>
              </div>
            </div>

            {/* Booking Summary */}
            {selectedDate && selectedTime && (
              <div className="rounded-xl bg-gray-50 p-4 mb-6">
                <div className="font-semibold mb-3 text-gray-800">Session Summary</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{dates.find(d => d.value === selectedDate)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">30 minutes</span>
                  </div>
                  <div className="border-t pt-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span>Session Fee:</span>
                      <span className="text-gray-500 line-through">₹150</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Special Price:</span>
                      <span className="font-bold text-blue-600 text-lg">₹49</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Confirm Button */}
            <Button
              disabled={!(selectedDate && selectedTime)}
              className="w-full rounded-lg text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              onClick={handleBooking}
            >
              {selectedDate && selectedTime ? `Confirm Booking – ₹49` : `Select Date & Time to Continue`}
            </Button>
          </div>
        </DialogContent>
      )}

      {/* Terms & Conditions Modal */}
      <TermsAndConditions
        open={showTerms}
        onOpenChange={setShowTerms}
        onAccept={handleAcceptTerms}
        title="Terms & Conditions - Session Booking"
      />
    </Dialog>
  );
}
