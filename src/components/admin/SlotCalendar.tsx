import React, { useState, useMemo } from 'react';
import { Button } from '@/design-system/components';
import type { TimeSlot, Listener } from '@/types/admin.types';

interface SlotCalendarProps {
  slots: TimeSlot[];
  listeners: Listener[];
  onSlotClick: (slot: TimeSlot) => void;
}

export const SlotCalendar: React.FC<SlotCalendarProps> = ({
  slots,
  listeners,
  onSlotClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const getListenerName = (listenerId?: string) => {
    if (!listenerId) return 'Unassigned';
    const listener = listeners.find(l => l.id === listenerId);
    return listener?.name || 'Unknown';
  };

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const getSlotsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return slots.filter(slot => slot.date === dateString);
  };

  const getSlotStatusColor = (slot: TimeSlot) => {
    if (slot.isBooked) return 'bg-red-100 text-red-800 border-red-200';
    if (slot.isAvailable) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysToShow = viewMode === 'month' ? getDaysInMonth(currentDate) : getWeekDays(currentDate);

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
            >
              ←
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
            >
              →
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'month' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="px-3 py-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {daysToShow.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const daySlots = getSlotsForDate(date);
            
            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 ${
                  !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                {/* Date Header */}
                <div className={`text-sm font-medium mb-2 ${
                  isToday 
                    ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center'
                    : isCurrentMonth 
                      ? 'text-gray-900' 
                      : 'text-gray-400'
                }`}>
                  {date.getDate()}
                </div>

                {/* Slots */}
                <div className="space-y-1">
                  {daySlots.slice(0, 3).map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotClick(slot)}
                      className={`w-full text-left px-2 py-1 text-xs rounded border ${getSlotStatusColor(slot)} hover:opacity-80 transition-opacity`}
                      title={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)} - ${getListenerName(slot.listenerId)}`}
                    >
                      <div className="font-medium truncate">
                        {formatTime(slot.startTime)}
                      </div>
                      <div className="truncate text-xs">
                        {getListenerName(slot.listenerId)}
                      </div>
                    </button>
                  ))}
                  
                  {daySlots.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{daySlots.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};
