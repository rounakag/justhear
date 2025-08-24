import type { 
  TimeSlot, 
  Listener, 
  RecurringSchedule, 
  AdminStats 
} from '@/types/admin.types';

// Mock Listeners
export const MOCK_LISTENERS: Listener[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@justhear.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'Certified listener with 5+ years experience in active listening and emotional support.',
    specialties: ['Relationship Issues', 'Work Stress', 'Anxiety'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    totalSessions: 1247,
    isActive: true,
    availability: [
      { id: '1', listenerId: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true, timezone: 'America/New_York' },
      { id: '2', listenerId: '1', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true, timezone: 'America/New_York' },
      { id: '3', listenerId: '1', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true, timezone: 'America/New_York' },
      { id: '4', listenerId: '1', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true, timezone: 'America/New_York' },
      { id: '5', listenerId: '1', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true, timezone: 'America/New_York' },
    ],
    hourlyRate: 75,
    currency: 'USD',
    timezone: 'America/New_York',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@justhear.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Experienced listener specializing in career guidance and personal development.',
    specialties: ['Career Guidance', 'Personal Development', 'Life Transitions'],
    languages: ['English', 'Mandarin'],
    rating: 4.8,
    totalSessions: 892,
    isActive: true,
    availability: [
      { id: '6', listenerId: '2', dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true, timezone: 'America/Los_Angeles' },
      { id: '7', listenerId: '2', dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true, timezone: 'America/Los_Angeles' },
      { id: '8', listenerId: '2', dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true, timezone: 'America/Los_Angeles' },
      { id: '9', listenerId: '2', dayOfWeek: 5, startTime: '10:00', endTime: '18:00', isAvailable: true, timezone: 'America/Los_Angeles' },
      { id: '10', listenerId: '2', dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isAvailable: true, timezone: 'America/Los_Angeles' },
    ],
    hourlyRate: 80,
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@justhear.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Compassionate listener with expertise in family dynamics and stress management.',
    specialties: ['Family Issues', 'Stress Management', 'Grief Support'],
    languages: ['English', 'Spanish', 'Portuguese'],
    rating: 4.9,
    totalSessions: 1563,
    isActive: true,
    availability: [
      { id: '11', listenerId: '3', dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true, timezone: 'America/Chicago' },
      { id: '12', listenerId: '3', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true, timezone: 'America/Chicago' },
      { id: '13', listenerId: '3', dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true, timezone: 'America/Chicago' },
      { id: '14', listenerId: '3', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true, timezone: 'America/Chicago' },
      { id: '15', listenerId: '3', dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true, timezone: 'America/Chicago' },
    ],
    hourlyRate: 70,
    currency: 'USD',
    timezone: 'America/Chicago',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
];

// Mock Recurring Schedules
export const MOCK_SCHEDULES: RecurringSchedule[] = [
  {
    id: '1',
    name: 'Weekday Morning Slots',
    description: 'Standard morning availability for weekdays',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '12:00',
    duration: 60,
    listenerId: '1',
    price: 75,
    currency: 'USD',
    timezone: 'America/New_York',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Weekend Afternoon Slots',
    description: 'Weekend availability for afternoon sessions',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    daysOfWeek: [6, 0],
    startTime: '14:00',
    endTime: '18:00',
    duration: 60,
    listenerId: '2',
    price: 80,
    currency: 'USD',
    timezone: 'America/Los_Angeles',
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

// Generate mock time slots for the next 30 days
export const MOCK_TIME_SLOTS: TimeSlot[] = (() => {
  const slots: TimeSlot[] = [];
  const listeners = MOCK_LISTENERS;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Generate 3-6 slots per day
    const slotsPerDay = Math.floor(Math.random() * 4) + 3;
    
    for (let j = 0; j < slotsPerDay; j++) {
      const startHour = 9 + Math.floor(j * 2);
      const startTime = new Date(date);
      startTime.setHours(startHour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startHour + 1, 0, 0, 0);
      
      const listener = listeners[Math.floor(Math.random() * listeners.length)];
      const isBooked = Math.random() > 0.7; // 30% chance of being booked
      const isAvailable = !isBooked && Math.random() > 0.1; // 90% chance of being available if not booked
      
      slots.push({
        id: `slot-${i}-${j}`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        date: dateString,
        dayOfWeek,
        isAvailable,
        isBooked,
        listenerId: listener.id,
        listenerName: listener.name,
        listenerAvatar: listener.avatar,
        price: listener.hourlyRate,
        currency: listener.currency,
        timezone: listener.timezone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  
  return slots;
})();

// Mock Admin Stats
export const MOCK_ADMIN_STATS: AdminStats = {
  totalSlots: MOCK_TIME_SLOTS.length,
  availableSlots: MOCK_TIME_SLOTS.filter(slot => slot.isAvailable && !slot.isBooked).length,
  bookedSlots: MOCK_TIME_SLOTS.filter(slot => slot.isBooked).length,
  totalListeners: MOCK_LISTENERS.length,
  activeListeners: MOCK_LISTENERS.filter(listener => listener.isActive).length,
  totalBookings: MOCK_TIME_SLOTS.filter(slot => slot.isBooked).length,
  revenue: MOCK_TIME_SLOTS.filter(slot => slot.isBooked).reduce((sum, slot) => sum + slot.price, 0),
  currency: 'USD',
};
