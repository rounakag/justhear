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
        slots = slots.filter((slot: TimeSlot) => slot.isAvailable === filters.isAvailable);
      }
      if (filters?.isBooked !== undefined) {
        slots = slots.filter((slot: TimeSlot) => slot.isBooked === filters.isBooked);
      }

      return slots;
    } catch (error) {
      console.error('Error fetching time slots:', error);
      return [];
    }
  }

  async getTimeSlot(id: string): Promise<TimeSlot> {
    try {
      const response = await fetch(`${this.baseUrl}/slots/${id}`);
      if (!response.ok) {
        throw new Error('Time slot not found');
      }
      const data = await response.json();
      return data.slot || data;
    } catch (error) {
      console.error('Error fetching time slot:', error);
      throw new Error('Failed to fetch time slot');
    }
  }

  async createTimeSlot(slotData: SlotEditorData): Promise<TimeSlot> {
    try {
      console.log('Sending slot data to backend:', slotData);
      const response = await fetch(`${this.baseUrl}/slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      });
      
      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend error response:', errorData);
        throw new Error(`Failed to create time slot: ${response.status} - ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Backend success response:', data);
      return data.slot || data;
    } catch (error) {
      console.error('Error creating time slot:', error);
      throw error; // Re-throw the actual error instead of generic message
    }
  }

  async updateTimeSlot(id: string, slotData: Partial<SlotEditorData>): Promise<TimeSlot> {
    try {
      const response = await fetch(`${this.baseUrl}/slots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slotData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update time slot');
      }
      
      const data = await response.json();
      return data.slot || data;
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw new Error('Failed to update time slot');
    }
  }

  async deleteTimeSlot(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/slots/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete time slot');
      }
    } catch (error) {
      console.error('Error deleting time slot:', error);
      throw new Error('Failed to delete time slot');
    }
  }

  // Bulk Slot Creation
  async createBulkSlots(bulkData: BulkSlotCreation): Promise<TimeSlot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/slots/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create bulk slots');
      }
      
      const data = await response.json();
      return data.slots || data;
    } catch (error) {
      console.error('Error creating bulk slots:', error);
      throw new Error('Failed to create bulk slots');
    }
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
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`);
      if (!response.ok) {
        throw new Error('Listener not found');
      }
      const data = await response.json();
      return {
        id: data.id,
        name: data.username,
        email: data.email,
        avatar: '/api/placeholder/150/150',
        bio: '',
        specialties: [],
        languages: [],
        rating: 0,
        totalSessions: 0,
        isActive: data.is_active,
        availability: [],
        hourlyRate: 50,
        currency: 'USD',
        timezone: 'America/New_York',
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      };
    } catch (error) {
      console.error('Error fetching listener:', error);
      throw new Error('Failed to fetch listener');
    }
  }

  async createListener(listenerData: Partial<Listener>): Promise<Listener> {
    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: listenerData.name,
          email: listenerData.email,
          password: 'defaultpassword123',
          role: 'listener',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create listener');
      }
      
      const data = await response.json();
      return {
        id: data.id,
        name: data.username,
        email: data.email,
        avatar: '/api/placeholder/150/150',
        bio: listenerData.bio || '',
        specialties: listenerData.specialties || [],
        languages: listenerData.languages || [],
        rating: listenerData.rating || 0,
        totalSessions: listenerData.totalSessions || 0,
        isActive: true,
        availability: listenerData.availability || [],
        hourlyRate: listenerData.hourlyRate || 50,
        currency: listenerData.currency || 'USD',
        timezone: listenerData.timezone || 'America/New_York',
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      };
    } catch (error) {
      console.error('Error creating listener:', error);
      throw new Error('Failed to create listener');
    }
  }

  async updateListener(id: string, listenerData: Partial<Listener>): Promise<Listener> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listenerData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listener');
      }
      
      const data = await response.json();
      return {
        id: data.id,
        name: data.username,
        email: data.email,
        avatar: '/api/placeholder/150/150',
        bio: listenerData.bio || '',
        specialties: listenerData.specialties || [],
        languages: listenerData.languages || [],
        rating: listenerData.rating || 0,
        totalSessions: listenerData.totalSessions || 0,
        isActive: data.is_active,
        availability: listenerData.availability || [],
        hourlyRate: listenerData.hourlyRate || 50,
        currency: listenerData.currency || 'USD',
        timezone: listenerData.timezone || 'America/New_York',
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
      };
    } catch (error) {
      console.error('Error updating listener:', error);
      throw new Error('Failed to update listener');
    }
  }

  async deleteListener(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listener');
      }
    } catch (error) {
      console.error('Error deleting listener:', error);
      throw new Error('Failed to delete listener');
    }
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
    try {
      const response = await fetch(`${this.baseUrl}/schedules`);
      if (!response.ok) {
        throw new Error('Failed to fetch recurring schedules');
      }
      const data = await response.json();
      return data.schedules || data || [];
    } catch (error) {
      console.error('Error fetching recurring schedules:', error);
      return [];
    }
  }

  async createRecurringSchedule(scheduleData: Partial<RecurringSchedule>): Promise<RecurringSchedule> {
    try {
      const response = await fetch(`${this.baseUrl}/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create recurring schedule');
      }
      
      const data = await response.json();
      return data.schedule || data;
    } catch (error) {
      console.error('Error creating recurring schedule:', error);
      throw new Error('Failed to create recurring schedule');
    }
  }

  async updateRecurringSchedule(id: string, scheduleData: Partial<RecurringSchedule>): Promise<RecurringSchedule> {
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update recurring schedule');
      }
      
      const data = await response.json();
      return data.schedule || data;
    } catch (error) {
      console.error('Error updating recurring schedule:', error);
      throw new Error('Failed to update recurring schedule');
    }
  }

  async deleteRecurringSchedule(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/schedules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recurring schedule');
      }
    } catch (error) {
      console.error('Error deleting recurring schedule:', error);
      throw new Error('Failed to delete recurring schedule');
    }
  }

  // Admin Statistics
  async getAdminStats(): Promise<AdminStats> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch admin stats');
      }
      const data = await response.json();
      return data.stats || data || {
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        totalListeners: 0,
        activeListeners: 0,
        totalBookings: 0,
        revenue: 0,
        currency: 'USD',
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return {
        totalSlots: 0,
        availableSlots: 0,
        bookedSlots: 0,
        totalListeners: 0,
        activeListeners: 0,
        totalBookings: 0,
        revenue: 0,
        currency: 'USD',
      };
    }
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
