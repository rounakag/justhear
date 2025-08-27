export interface TimeSlot {
  id: string;
  start_time: string; // Database field name
  end_time: string; // Database field name
  startTime?: string; // Legacy field for compatibility
  endTime?: string; // Legacy field for compatibility
  date: string; // YYYY-MM-DD
  dayOfWeek?: number; // 0-6 (Sunday-Saturday)
  isAvailable?: boolean;
  isBooked?: boolean;
  status: 'created' | 'booked' | 'completed';
  listenerId: string; // Mandatory listener assignment
  listenerName?: string; // For display purposes
  listenerEmail?: string; // For display purposes
  createdAt?: string;
  updatedAt?: string;
  // Meeting link properties
  meeting_link?: string;
  meeting_id?: string;
  meeting_provider?: string;
}

export interface Listener {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  specialties: string[];
  languages: string[];
  rating: number;
  totalSessions: number;
  isActive: boolean;
  availability: ListenerAvailability[];
  hourlyRate: number;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListenerAvailability {
  id: string;
  listenerId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isAvailable: boolean;
  timezone: string;
}

export interface RecurringSchedule {
  id: string;
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysOfWeek: number[]; // [0,1,2,3,4,5,6]
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  duration: number; // minutes
  listenerId?: string;
  price: number;
  currency: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SlotFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  listenerId?: string; // Filter by specific listener
  isAvailable?: boolean;
  isBooked?: boolean;
  dayOfWeek?: number;
}

export interface BulkSlotCreation {
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  duration: number;
  listenerId: string; // Mandatory listener assignment
}

export interface SlotEditorData {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  listenerId: string; // Mandatory listener assignment
  isAvailable: boolean;
}

export interface CalendarViewState {
  currentMonth: Date;
  selectedDate?: Date;
  selectedSlot?: TimeSlot;
  viewMode: 'month' | 'week' | 'day';
}

export interface AdminStats {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  totalListeners: number;
  activeListeners: number;
  totalBookings: number;
  revenue: number;
  currency: string;
}
