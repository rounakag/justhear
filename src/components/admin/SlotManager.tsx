import React, { useState } from 'react';
import { SlotEditor } from './SlotEditor';
import { BulkSlotCreator } from './BulkSlotCreator';
import { SlotCalendar } from './SlotCalendar';
import { SlotFilters } from './SlotFilters';
import { AdminStats } from './AdminStats';
import { useAdminSlots } from '@/hooks/useAdminSlots';
import type { TimeSlot } from '@/types/admin.types';

export const SlotManager: React.FC = () => {
  const {
    slots,
    listeners,
    schedules,
    stats,
    loading,
    error,
    filters,
    setFilters,
    refreshData,
    clearError,
  } = useAdminSlots();

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showSlotEditor, setShowSlotEditor] = useState(false);
  const [showBulkCreator, setShowBulkCreator] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const handleViewModeChange = (mode: 'calendar' | 'list') => {
    setViewMode(mode);
  };

  // Filter slots based on current filters
  const filteredSlots = React.useMemo(() => {
    let filtered = slots;

    if (filters.listenerId) {
      filtered = filtered.filter(slot => slot.listenerId === filters.listenerId);
    }

    if (filters.isAvailable !== undefined) {
      filtered = filtered.filter(slot => slot.isAvailable === filters.isAvailable);
    }

    if (filters.isBooked !== undefined) {
      filtered = filtered.filter(slot => slot.isBooked === filters.isBooked);
    }

    if (filters.dayOfWeek !== undefined) {
      filtered = filtered.filter(slot => slot.dayOfWeek === filters.dayOfWeek);
    }

    return filtered;
  }, [slots, filters]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setShowSlotEditor(true);
  };

  const handleCreateSlot = () => {
    setSelectedSlot(null);
    setShowSlotEditor(true);
  };

  const handleCloseSlotEditor = () => {
    setShowSlotEditor(false);
    setSelectedSlot(null);
  };

  const handleCloseBulkCreator = () => {
    setShowBulkCreator(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading slot data</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <button 
                onClick={clearError} 
                className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Slot Management</h1>
              <p className="text-gray-600 mt-1">Manage time slots, listeners, and schedules</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowBulkCreator(true)}
                className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 rounded-md transition-colors sm:w-auto"
              >
                📅 Bulk Create
              </button>
              <button
                onClick={handleCreateSlot}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors sm:w-auto"
              >
                ➕ Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && <AdminStats stats={stats} className="mb-6" />}

        {/* Filters */}
        <SlotFilters
          filters={filters}
          onFiltersChange={setFilters}
          listeners={listeners}
          className="mb-6"
        />

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
              onClick={() => handleViewModeChange('calendar')}
            >
              📅 Calendar
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
              onClick={() => handleViewModeChange('list')}
            >
              📋 List
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={refreshData}
              disabled={loading}
            >
              🔄 Refresh
            </button>
            <span className="text-sm text-gray-500">
              {filteredSlots.length} slots
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading slots...</span>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'calendar' ? (
                <SlotCalendar
                  slots={filteredSlots}
                  onSlotClick={handleSlotClick}
                  listeners={listeners}
                />
              ) : (
                <SlotList
                  slots={filteredSlots}
                  onSlotClick={handleSlotClick}
                  listeners={listeners}
                />
              )}
            </>
          )}
        </div>

        {/* Modals */}
        {showSlotEditor && (
          <SlotEditor
            slot={selectedSlot}
            listeners={listeners}
            onClose={handleCloseSlotEditor}
            onSave={refreshData}
          />
        )}

        {showBulkCreator && (
          <BulkSlotCreator
            listeners={listeners}
            schedules={schedules}
            onClose={handleCloseBulkCreator}
            onSave={refreshData}
          />
        )}
      </div>
    </div>
  );
};

// Slot List Component for list view
interface SlotListProps {
  slots: TimeSlot[];
  listeners: any[];
  onSlotClick: (slot: TimeSlot) => void;
}

const SlotList: React.FC<SlotListProps> = ({ slots, listeners, onSlotClick }) => {
  
  const getListenerName = (listenerId?: string) => {
    if (!listenerId) return 'Unassigned';
    const listener = listeners.find(l => l.id === listenerId);
    return listener?.name || 'Unknown';
  };

  const formatTime = (time: string) => {
    try {
      console.log('🔍 DEBUG - Raw time from database:', time, 'Type:', typeof time);
      
      // BULLETPROOF TIME PARSING
      if (!time || time === 'null' || time === 'undefined') {
        throw new Error('Time is null, undefined, or empty');
      }
      
      // Clean the time string
      const cleanTime = time.toString().trim();
      console.log('🔍 DEBUG - Cleaned time:', cleanTime);
      
      // Handle time strings like "14:00:00" or "14:00"
      const timeParts = cleanTime.split(':');
      console.log('🔍 DEBUG - Time parts:', timeParts);
      
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        
        console.log('🔍 DEBUG - Parsed hours:', hours, 'minutes:', minutes);
        
        // Validate hours and minutes
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          throw new Error(`Invalid time values: hours=${hours}, minutes=${minutes}`);
        }
        
        // Create a date object with the time
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        
        const result = date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        
        console.log('🔍 DEBUG - Final time result:', result);
        return result;
      }
      
      // Fallback to original method
      const fallbackResult = new Date(cleanTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      
      console.log('🔍 DEBUG - Fallback time result:', fallbackResult);
      return fallbackResult;
    } catch (error) {
      console.error('❌ ERROR formatting time:', error, 'Time value:', time);
      return 'Invalid Time';
    }
  };

  const formatDate = (date: string) => {
    try {
      console.log('🔍 DEBUG - Raw date from database:', date, 'Type:', typeof date, 'Length:', date?.length);
      
      // BULLETPROOF DATE PARSING
      let parsedDate: Date;
      
      if (!date || date === 'null' || date === 'undefined') {
        throw new Error('Date is null, undefined, or empty');
      }
      
      if (typeof date === 'string') {
        // Remove any extra whitespace
        const cleanDate = date.trim();
        
        if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // YYYY-MM-DD format - most common from database
          parsedDate = new Date(cleanDate + 'T00:00:00.000Z');
        } else if (cleanDate.includes('T')) {
          // ISO format with time
          parsedDate = new Date(cleanDate);
        } else if (cleanDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
          // MM/DD/YYYY format
          const [month, day, year] = cleanDate.split('/');
          parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          // Try parsing as is
          parsedDate = new Date(cleanDate);
        }
      } else {
        parsedDate = new Date(date);
      }
      
      console.log('🔍 DEBUG - Parsed date object:', parsedDate);
      console.log('🔍 DEBUG - Is valid date:', !isNaN(parsedDate.getTime()));
      console.log('🔍 DEBUG - Date timestamp:', parsedDate.getTime());
      
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date object created from: ${date}`);
      }
      
      const formatted = parsedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      
      console.log('🔍 DEBUG - Final formatted result:', formatted);
      return formatted;
    } catch (error) {
      console.error('❌ ERROR formatting date:', error, 'Date value:', date);
      return 'Invalid Date';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Listener
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {slots.map((slot) => {
            if (!slot || !slot.id) {
              console.warn('Invalid slot data:', slot);
              return null;
            }
            return (
              <tr
                key={slot.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onSlotClick(slot)}
              >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(slot.date)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getListenerName(slot.listenerId)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  slot.isBooked
                    ? 'bg-red-100 text-red-800'
                    : slot.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {slot.isBooked ? 'Booked' : slot.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${slot.price}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors">
                  Edit
                </button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
      {slots.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No slots found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
