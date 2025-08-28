import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAdminSlots } from '@/hooks/useAdminSlots';
import type { TimeSlot, SlotEditorData, Listener } from '@/types/admin.types';

// Helper function to format time for input field
function formatTimeForInput(timeString: string): string {
  try {
    // Handle time strings like "09:00:00" or "09:00"
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
    }
    return timeString;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
}

interface SlotEditorProps {
  slot?: TimeSlot | null;
  listeners: Listener[];
  slots: TimeSlot[]; // Add existing slots for overlap checking
  onClose: () => void;
  onSave: () => void;
}

export const SlotEditor: React.FC<SlotEditorProps> = ({
  slot,
  listeners,
  slots,
  onClose,
  onSave,
}) => {
  const { createSlot, updateSlot, loading } = useAdminSlots();
  const [formData, setFormData] = useState<SlotEditorData>({
    date: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
  });
  const [existingSlots, setExistingSlots] = useState<TimeSlot[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (slot) {
      setFormData({
        date: slot.date,
        startTime: formatTimeForInput(slot.start_time || slot.startTime || ''),
        endTime: formatTimeForInput(slot.end_time || slot.endTime || ''),
        listenerId: slot.listenerId || '',
        isAvailable: slot.isAvailable || true,
      });
    } else {
      // Set default values for new slot
      const now = new Date();
      setFormData({
        date: now.toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
        isAvailable: true,
      });
    }
  }, [slot]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Check if date is in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        newErrors.date = 'Cannot select past dates';
      }
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    // Note: Listener assignment is not required for slot creation
    // Slots are created unassigned and get assigned when booked

    // Check if selected time is in the past for today's date
    if (formData.date && formData.startTime) {
      const selectedDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const now = new Date();
      
      if (selectedDateTime <= now) {
        newErrors.startTime = 'Cannot select past times';
      }
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Submitting slot data:', formData);
      if (slot) {
        await updateSlot(slot.id, formData);
      } else {
        await createSlot(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save slot:', error);
      
      // Handle specific error types with better messages
      let errorMessage = 'Failed to save slot';
      
      if (error instanceof Error) {
        if (error.message.includes('overlaps with existing slot')) {
          errorMessage = '⏰ Time Conflict: This slot overlaps with an existing slot for the same listener. Please choose a different time or date.';
        } else if (error.message.includes('Invalid slot data')) {
          errorMessage = '❌ Invalid Data: Please check the time and date values.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  const handleInputChange = (field: keyof SlotEditorData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Check for existing slots when date or listener changes
    if (field === 'date' || field === 'listenerId') {
      checkExistingSlots();
    }
  };

  const checkExistingSlots = () => {
    if (formData.date && formData.listenerId) {
      const existing = slots.filter(s => 
        s.date === formData.date && 
        s.listenerId === formData.listenerId &&
        s.id !== slot?.id // Exclude current slot if editing
      );
      setExistingSlots(existing);
    } else {
      setExistingSlots([]);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" aria-describedby="slot-editor-description">
        <DialogHeader>
          <DialogTitle>
            {slot ? 'Edit Time Slot' : 'Create New Time Slot'}
          </DialogTitle>
          <DialogDescription id="slot-editor-description">
            {slot ? 'Modify the time slot details below.' : 'Create a new time slot by filling in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endTime ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
            </div>
          </div>

          {/* Slot Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Slot Creation Info
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>✅ Slots are created as unassigned and will be visible to users</p>
                  <p>✅ A listener will be automatically assigned when a user books the slot</p>
                  <p>✅ Once booked, the slot will no longer be visible to other users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Slots Warning */}
          {existingSlots.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Existing slots for this listener on {formData.date}:
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    {existingSlots.map(s => (
                      <div key={s.id} className="flex justify-between">
                        <span>{s.start_time} - {s.end_time}</span>
                        <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-yellow-600">
                    ⚠️ Make sure your new slot doesn't overlap with these times.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Availability */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.isAvailable}
              onChange={(e) => handleInputChange('isAvailable', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
              Available for booking
            </label>
          </div>



          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : slot ? 'Update Slot' : 'Create Slot'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
