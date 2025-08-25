import type { 
  TimeSlot, 
  Listener, 
  ListenerAvailability, 
  RecurringSchedule, 
  SlotFilters, 
  BulkSlotCreation, 
  SlotEditorData,
  AdminStats 
} from '@/types/admin.types';
import { apiService } from './api';

class AdminService {
  private baseUrl = 'https://justhear-backend.onrender.com/api';

  // TimeSlot Management
  async getTimeSlots(filters?: SlotFilters): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/slots`);
      if (!response.ok) {
        throw new Error('Failed to fetch time slots');
      }
      
      const data = await response.json();
      let slots = data.slots || data || [];

      // Apply filters
      if (filters?.dateRange) {
        slots = slots.filter((slot: TimeSlot) => 
          slot.date >= filters.dateRange!.start && slot.date <= filters.dateRange!.end
        );
      }
      if (filters?.listenerId) {
        slots = slots.filter((slot: TimeSlot) => slot.listenerId === filters.listenerId);
      }
      if (filters?.isAvailable !== undefined) {
        slots = slots.filter((slot: TimeSlot) => slot.status === 'available');
      }
      if (filters?.isBooked !== undefined) {
        slots = slots.filter((slot: TimeSlot) => slot.status === 'booked');
      }

      return slots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  }

  async getTimeSlot(id: string): Promise<TimeSlot> {
    const slot = this.mockData.slots.find(s => s.id === id);
    if (!slot) throw new Error('Time slot not found');
    return slot;
  }

  async createTimeSlot(slotData: SlotEditorData): Promise<TimeSlot> {
    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      startTime: new Date(`${slotData.date}T${slotData.startTime}`).toISOString(),
      endTime: new Date(`${slotData.date}T${slotData.endTime}`).toISOString(),
      date: slotData.date,
      dayOfWeek: new Date(slotData.date).getDay(),
      isAvailable: slotData.isAvailable,
      isBooked: false,
      listenerId: slotData.listenerId,
      listenerName: this.mockData.listeners.find(l => l.id === slotData.listenerId)?.name,
      listenerAvatar: this.mockData.listeners.find(l => l.id === slotData.listenerId)?.avatar,
      price: slotData.price,
      currency: 'USD',
      timezone: slotData.timezone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.mockData.slots.push(newSlot);
    return newSlot;
  }

  async updateTimeSlot(id: string, slotData: Partial<SlotEditorData>): Promise<TimeSlot> {
    const slotIndex = this.mockData.slots.findIndex(s => s.id === id);
    if (slotIndex === -1) throw new Error('Time slot not found');
    
    const updatedSlot = { ...this.mockData.slots[slotIndex] };
    
    if (slotData.date) {
      updatedSlot.date = slotData.date;
      updatedSlot.dayOfWeek = new Date(slotData.date).getDay();
    }
    if (slotData.startTime) {
      updatedSlot.startTime = new Date(`${updatedSlot.date}T${slotData.startTime}`).toISOString();
    }
    if (slotData.endTime) {
      updatedSlot.endTime = new Date(`${updatedSlot.date}T${slotData.endTime}`).toISOString();
    }
    if (slotData.listenerId !== undefined) {
      updatedSlot.listenerId = slotData.listenerId;
      updatedSlot.listenerName = this.mockData.listeners.find(l => l.id === slotData.listenerId)?.name;
      updatedSlot.listenerAvatar = this.mockData.listeners.find(l => l.id === slotData.listenerId)?.avatar;
    }
    if (slotData.price !== undefined) {
      updatedSlot.price = slotData.price;
    }
    if (slotData.isAvailable !== undefined) {
      updatedSlot.isAvailable = slotData.isAvailable;
    }
    if (slotData.timezone) {
      updatedSlot.timezone = slotData.timezone;
    }
    
    updatedSlot.updatedAt = new Date().toISOString();
    this.mockData.slots[slotIndex] = updatedSlot;
    
    return updatedSlot;
  }

  async deleteTimeSlot(id: string): Promise<void> {
    const slotIndex = this.mockData.slots.findIndex(s => s.id === id);
    if (slotIndex === -1) throw new Error('Time slot not found');
    this.mockData.slots.splice(slotIndex, 1);
  }

  // Bulk Slot Creation
  async createBulkSlots(bulkData: BulkSlotCreation): Promise<TimeSlot[]> {
    const newSlots: TimeSlot[] = [];
    const startDate = new Date(bulkData.startDate);
    const endDate = new Date(bulkData.endDate);
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      if (bulkData.daysOfWeek.includes(date.getDay())) {
        const dateString = date.toISOString().split('T')[0];
        const startTime = new Date(`2000-01-01T${bulkData.startTime}`);
        const endTime = new Date(`2000-01-01T${bulkData.endTime}`);
        const timeDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const slotsPerDay = Math.floor(timeDiff / bulkData.duration);
        
        for (let i = 0; i < slotsPerDay; i++) {
          const slotStartTime = new Date(startTime);
          slotStartTime.setMinutes(startTime.getMinutes() + (i * bulkData.duration));
          
          const slotEndTime = new Date(slotStartTime);
          slotEndTime.setMinutes(slotStartTime.getMinutes() + bulkData.duration);
          
          const newSlot: TimeSlot = {
            id: `slot-${Date.now()}-${i}`,
            startTime: new Date(`${dateString}T${slotStartTime.toTimeString().slice(0, 5)}`).toISOString(),
            endTime: new Date(`${dateString}T${slotEndTime.toTimeString().slice(0, 5)}`).toISOString(),
            date: dateString,
            dayOfWeek: date.getDay(),
            isAvailable: true,
            isBooked: false,
            listenerId: bulkData.listenerId,
            listenerName: this.mockData.listeners.find(l => l.id === bulkData.listenerId)?.name,
            listenerAvatar: this.mockData.listeners.find(l => l.id === bulkData.listenerId)?.avatar,
            price: bulkData.price,
            currency: 'USD',
            timezone: bulkData.timezone,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          newSlots.push(newSlot);
          this.mockData.slots.push(newSlot);
        }
      }
    }
    
    return newSlots;
  }

  // Listener Management
  async getListeners(): Promise<Listener[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users`);
      if (!response.ok) {
        throw new Error('Failed to fetch listeners');
      }
      
      const data = await response.json();
      const users = data.users || [];
      
      // Filter only listeners
      return users
        .filter((user: any) => user.role === 'listener')
        .map((user: any) => ({
          id: user.id,
          name: user.username,
          email: user.email,
          avatar: '/api/placeholder/150/150',
          isActive: user.is_active,
          hourlyRate: 25.00, // Default rate
          specialties: [],
          availability: {},
          createdAt: user.created_at,
          updatedAt: user.updated_at || user.created_at,
        }));
    } catch (error) {
      console.error('Error fetching listeners:', error);
      return [];
    }
  }

  async getListener(id: string): Promise<Listener> {
    const listener = this.mockData.listeners.find(l => l.id === id);
    if (!listener) throw new Error('Listener not found');
    return listener;
  }

  async createListener(listenerData: Partial<Listener>): Promise<Listener> {
    const newListener: Listener = {
      id: `listener-${Date.now()}`,
      name: listenerData.name || '',
      email: listenerData.email || '',
      avatar: listenerData.avatar,
      bio: listenerData.bio,
      specialties: listenerData.specialties || [],
      languages: listenerData.languages || [],
      rating: listenerData.rating || 0,
      totalSessions: listenerData.totalSessions || 0,
      isActive: listenerData.isActive ?? true,
      availability: listenerData.availability || [],
      hourlyRate: listenerData.hourlyRate || 50,
      currency: listenerData.currency || 'USD',
      timezone: listenerData.timezone || 'America/New_York',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.mockData.listeners.push(newListener);
    return newListener;
  }

  async updateListener(id: string, listenerData: Partial<Listener>): Promise<Listener> {
    const listenerIndex = this.mockData.listeners.findIndex(l => l.id === id);
    if (listenerIndex === -1) throw new Error('Listener not found');
    
    this.mockData.listeners[listenerIndex] = {
      ...this.mockData.listeners[listenerIndex],
      ...listenerData,
      updatedAt: new Date().toISOString(),
    };
    
    return this.mockData.listeners[listenerIndex];
  }

  async deleteListener(id: string): Promise<void> {
    const listenerIndex = this.mockData.listeners.findIndex(l => l.id === id);
    if (listenerIndex === -1) throw new Error('Listener not found');
    this.mockData.listeners.splice(listenerIndex, 1);
  }

  // Listener Availability
  async getListenerAvailability(listenerId: string): Promise<ListenerAvailability[]> {
    const response = await fetch(`${this.baseUrl}/listeners/${listenerId}/availability`);
    if (!response.ok) throw new Error('Failed to fetch listener availability');
    return response.json();
  }

  async updateListenerAvailability(
    listenerId: string, 
    availability: ListenerAvailability[]
  ): Promise<ListenerAvailability[]> {
    const response = await fetch(`${this.baseUrl}/listeners/${listenerId}/availability`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(availability),
    });
    if (!response.ok) throw new Error('Failed to update listener availability');
    return response.json();
  }

  // Recurring Schedules
  async getRecurringSchedules(): Promise<RecurringSchedule[]> {
    return this.mockData.schedules;
  }

  async createRecurringSchedule(scheduleData: Partial<RecurringSchedule>): Promise<RecurringSchedule> {
    const newSchedule: RecurringSchedule = {
      id: `schedule-${Date.now()}`,
      name: scheduleData.name || '',
      description: scheduleData.description,
      startDate: scheduleData.startDate || '',
      endDate: scheduleData.endDate || '',
      daysOfWeek: scheduleData.daysOfWeek || [],
      startTime: scheduleData.startTime || '09:00',
      endTime: scheduleData.endTime || '17:00',
      duration: scheduleData.duration || 60,
      listenerId: scheduleData.listenerId,
      price: scheduleData.price || 50,
      currency: scheduleData.currency || 'USD',
      timezone: scheduleData.timezone || 'America/New_York',
      isActive: scheduleData.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.mockData.schedules.push(newSchedule);
    return newSchedule;
  }

  async updateRecurringSchedule(id: string, scheduleData: Partial<RecurringSchedule>): Promise<RecurringSchedule> {
    const scheduleIndex = this.mockData.schedules.findIndex(s => s.id === id);
    if (scheduleIndex === -1) throw new Error('Recurring schedule not found');
    
    this.mockData.schedules[scheduleIndex] = {
      ...this.mockData.schedules[scheduleIndex],
      ...scheduleData,
      updatedAt: new Date().toISOString(),
    };
    
    return this.mockData.schedules[scheduleIndex];
  }

  async deleteRecurringSchedule(id: string): Promise<void> {
    const scheduleIndex = this.mockData.schedules.findIndex(s => s.id === id);
    if (scheduleIndex === -1) throw new Error('Recurring schedule not found');
    this.mockData.schedules.splice(scheduleIndex, 1);
  }

  // Admin Statistics
  async getAdminStats(): Promise<AdminStats> {
    // Recalculate stats based on current data
    const stats: AdminStats = {
      totalSlots: this.mockData.slots.length,
      availableSlots: this.mockData.slots.filter(slot => slot.isAvailable && !slot.isBooked).length,
      bookedSlots: this.mockData.slots.filter(slot => slot.isBooked).length,
      totalListeners: this.mockData.listeners.length,
      activeListeners: this.mockData.listeners.filter(listener => listener.isActive).length,
      totalBookings: this.mockData.slots.filter(slot => slot.isBooked).length,
      revenue: this.mockData.slots.filter(slot => slot.isBooked).reduce((sum, slot) => sum + slot.price, 0),
      currency: 'USD',
    };
    
    return stats;
  }

  // Utility Methods
  async checkListenerAvailability(
    listenerId: string, 
    date: string, 
    startTime: string, 
    endTime: string
  ): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/listeners/${listenerId}/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime, endTime }),
    });
    if (!response.ok) throw new Error('Failed to check listener availability');
    return response.json();
  }

  async generateSlotsFromSchedule(scheduleId: string, startDate: string, endDate: string): Promise<TimeSlot[]> {
    const response = await fetch(`${this.baseUrl}/schedules/${scheduleId}/generate-slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) throw new Error('Failed to generate slots from schedule');
    return response.json();
  }
}

export const adminService = new AdminService();
