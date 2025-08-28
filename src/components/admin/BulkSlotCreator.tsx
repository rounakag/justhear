import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

import { useAdminSlots } from '@/hooks/useAdminSlots';
import type { BulkSlotCreation, Listener, RecurringSchedule } from '@/types/admin.types';

interface BulkSlotCreatorProps {
  listeners: Listener[];
  schedules: RecurringSchedule[];
  onClose: () => void;
  onSave: () => void;
}

export const BulkSlotCreator: React.FC<BulkSlotCreatorProps> = ({
  listeners,
  schedules,
  onClose,
  onSave,
}) => {
  const { createBulkSlots, loading } = useAdminSlots();
  const [formData, setFormData] = useState<BulkSlotCreation>({
    startDate: '',
    endDate: '',
    daysOfWeek: [],
    startTime: '09:00',
    endTime: '17:00',
    duration: 60,
    listenerId: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');

  const daysOfWeekOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.daysOfWeek.length === 0) {
      newErrors.daysOfWeek = 'Select at least one day of the week';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      
      if (start >= end) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be positive';
    }

    if (!formData.listenerId) {
      newErrors.listenerId = 'Listener assignment is required';
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
      await createBulkSlots(formData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to create bulk slots:', error);
    }
  };

  const handleInputChange = (field: keyof BulkSlotCreation, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day].sort(),
    }));
  };

  const handleScheduleSelect = (scheduleId: string) => {
    if (scheduleId) {
      const schedule = schedules.find(s => s.id === scheduleId);
      if (schedule) {
        setFormData(prev => ({
          ...prev,
          daysOfWeek: schedule.daysOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: schedule.duration,
          listenerId: schedule.listenerId || '',
          price: schedule.price,
          timezone: schedule.timezone,
        }));
      }
    }
    setSelectedSchedule(scheduleId);
  };

  const calculateSlotCount = () => {
    if (!formData.startDate || !formData.endDate || formData.daysOfWeek.length === 0) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let count = 0;
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      if (formData.daysOfWeek.includes(date.getDay())) {
        count++;
      }
    }

    // Calculate slots per day based on time range and duration
    const startTime = new Date(`2000-01-01T${formData.startTime}`);
    const endTime = new Date(`2000-01-01T${formData.endTime}`);
    const timeDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const slotsPerDay = Math.floor(timeDiff / formData.duration);

    return count * slotsPerDay;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="bulk-slot-description">
        <DialogHeader>
          <DialogTitle>Bulk Create Time Slots</DialogTitle>
          <DialogDescription id="bulk-slot-description">
            Create multiple time slots at once by specifying date range, days of the week, and time slots.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Schedule Template */}
          {schedules.length > 0 && (
            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-1">
                Use Schedule Template (Optional)
              </label>
              <select
                id="schedule"
                value={selectedSchedule}
                onChange={(e) => handleScheduleSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a schedule template</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.name} - {schedule.daysOfWeek.map(d => daysOfWeekOptions[d].label.slice(0, 3)).join(', ')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Days of Week */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days of Week *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {daysOfWeekOptions.map((day) => (
                <label key={day.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.daysOfWeek.includes(day.value)}
                    onChange={() => handleDayToggle(day.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                </label>
              ))}
            </div>
            {errors.daysOfWeek && <p className="text-red-500 text-sm mt-1">{errors.daysOfWeek}</p>}
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
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
                End Time
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

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Slot Duration (minutes)
            </label>
            <input
              type="number"
              id="duration"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>

          {/* Listener Assignment */}
          <div>
            <label htmlFor="listenerId" className="block text-sm font-medium text-gray-700 mb-1">
              Assign Listener
            </label>
            <select
              id="listenerId"
              value={formData.listenerId}
              onChange={(e) => handleInputChange('listenerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a listener (optional)</option>
              {listeners.map((listener) => (
                <option key={listener.id} value={listener.id}>
                  {listener.name} - ${listener.hourlyRate}/hr
                </option>
              ))}
            </select>
          </div>





          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Summary</h4>
            <p className="text-sm text-blue-700">
              This will create approximately <strong>{calculateSlotCount()}</strong> time slots
              across {formData.daysOfWeek.length} day(s) of the week.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Slots...' : 'Create Slots'}
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
