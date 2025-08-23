import React, { useState } from "react";
import { Button } from "@/components/ui/Button/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

const SLOTS: Record<string, string[]> = {
  "2025-08-19": ["09:00", "10:30", "14:00", "15:30", "17:00", "19:00", "20:30"],
  "2025-08-20": ["10:00", "11:30", "13:00", "16:00", "18:00", "19:30", "21:00"],
  "2025-08-21": ["08:30", "10:00", "12:00", "14:30", "16:30", "18:30", "20:00"],
  "2025-08-22": ["09:30", "11:00", "13:30", "15:00", "17:30", "19:00", "21:30"],
  "2025-08-23": ["10:30", "12:00", "14:00", "15:30", "17:00", "18:30", "20:30"],
  "2025-08-24": ["09:00", "10:30", "12:30", "14:30", "16:00", "19:30", "21:00"],
  "2025-08-25": ["08:00", "11:00", "13:00", "15:00", "17:30", "19:00", "20:30"]
};

interface SchedulerModalProps {
  triggerClassName?: string;
  children?: React.ReactNode;
}

export function SchedulerModal({ triggerClassName, children }: SchedulerModalProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleOpen = () => {
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

  const times = selectedDate ? SLOTS[selectedDate] || [] : [];

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) return;
    
    alert(`Booking confirmed!\n\nDate: ${dates.find(d => d.value === selectedDate)?.label}\nTime: ${selectedTime}\nAmount: ₹49\n\nYou will receive a confirmation call 5 minutes before your session.`);
    
    setOpen(false);
    setSelectedDate(null);
    setSelectedTime(null);
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
                {selectedDate ? (
                  times.length > 0 ? (
                    times.map((tm) => (
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
    </Dialog>
  );
}
