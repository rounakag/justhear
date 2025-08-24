const axios = require('axios');
const crypto = require('crypto');
const db = require('../config/database');
const logger = require('../utils/logger');

class MeetingService {
  constructor() {
    this.zoomApiKey = process.env.ZOOM_API_KEY;
    this.zoomApiSecret = process.env.ZOOM_API_SECRET;
    this.zoomAccountId = process.env.ZOOM_ACCOUNT_ID;
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.teamsClientId = process.env.TEAMS_CLIENT_ID;
    this.teamsClientSecret = process.env.TEAMS_CLIENT_SECRET;
  }

  /**
   * Generate a meeting link for a booking
   */
  async generateMeetingLink(bookingId, provider = 'zoom', meetingType = 'video') {
    try {
      // Get booking details
      const booking = await db('bookings')
        .where('id', bookingId)
        .first();

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Generate unique meeting ID
      const meetingId = this.generateMeetingId();
      
      let meetingData;
      
      switch (provider) {
        case 'zoom':
          meetingData = await this.createZoomMeeting(booking, meetingId, meetingType);
          break;
        case 'google_meet':
          meetingData = await this.createGoogleMeet(booking, meetingId, meetingType);
          break;
        case 'teams':
          meetingData = await this.createTeamsMeeting(booking, meetingId, meetingType);
          break;
        case 'custom':
          meetingData = this.createCustomMeeting(booking, meetingId, meetingType);
          break;
        default:
          throw new Error('Unsupported meeting provider');
      }

      // Save meeting link to database
      const meetingLink = await db('meeting_links').insert({
        booking_id: bookingId,
        meeting_id: meetingId,
        meeting_url: meetingData.url,
        meeting_password: meetingData.password || null,
        provider: provider,
        meeting_type: meetingType,
        expires_at: this.calculateExpiryTime(booking.start_time),
      }).returning('*');

      logger.info(`Meeting link created for booking ${bookingId}`, {
        provider,
        meetingType,
        meetingId
      });

      return meetingLink[0];
    } catch (error) {
      logger.error('Error generating meeting link:', error);
      throw error;
    }
  }

  /**
   * Create Zoom meeting
   */
  async createZoomMeeting(booking, meetingId, meetingType) {
    try {
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);
      
      const meetingData = {
        topic: `JustHear Session - ${meetingId}`,
        type: 2, // Scheduled meeting
        start_time: startTime.toISOString(),
        duration: Math.ceil((endTime - startTime) / (1000 * 60)), // Duration in minutes
        timezone: 'UTC',
        password: this.generatePassword(),
        settings: {
          host_video: meetingType === 'video',
          participant_video: meetingType === 'video',
          join_before_host: true,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none',
          waiting_room: false,
        }
      };

      const token = this.generateZoomJWT();
      
      const response = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        meetingData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        url: response.data.join_url,
        password: response.data.password,
        meetingId: response.data.id
      };
    } catch (error) {
      logger.error('Error creating Zoom meeting:', error);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  /**
   * Create Google Meet meeting
   */
  async createGoogleMeet(booking, meetingId, meetingType) {
    try {
      // For Google Meet, we'll use a simple URL generation
      // In production, you'd use Google Calendar API to create actual meetings
      const meetUrl = `https://meet.google.com/${this.generateGoogleMeetCode()}`;
      
      return {
        url: meetUrl,
        password: null,
        meetingId: meetingId
      };
    } catch (error) {
      logger.error('Error creating Google Meet:', error);
      throw new Error('Failed to create Google Meet');
    }
  }

  /**
   * Create Microsoft Teams meeting
   */
  async createTeamsMeeting(booking, meetingId, meetingType) {
    try {
      // For Teams, we'll use a simple URL generation
      // In production, you'd use Microsoft Graph API to create actual meetings
      const teamsUrl = `https://teams.microsoft.com/l/meetup-join/${this.generateTeamsCode()}`;
      
      return {
        url: teamsUrl,
        password: null,
        meetingId: meetingId
      };
    } catch (error) {
      logger.error('Error creating Teams meeting:', error);
      throw new Error('Failed to create Teams meeting');
    }
  }

  /**
   * Create custom meeting (for internal video/audio system)
   */
  createCustomMeeting(booking, meetingId, meetingType) {
    const baseUrl = process.env.CUSTOM_MEETING_BASE_URL || 'https://meet.justhear.com';
    const customUrl = `${baseUrl}/${meetingId}`;
    
    return {
      url: customUrl,
      password: this.generatePassword(),
      meetingId: meetingId
    };
  }

  /**
   * Get meeting link for a booking
   */
  async getMeetingLink(bookingId) {
    try {
      const meetingLink = await db('meeting_links')
        .where('booking_id', bookingId)
        .where('is_active', true)
        .first();

      return meetingLink;
    } catch (error) {
      logger.error('Error getting meeting link:', error);
      throw error;
    }
  }

  /**
   * Update meeting link
   */
  async updateMeetingLink(meetingLinkId, updates) {
    try {
      const updated = await db('meeting_links')
        .where('id', meetingLinkId)
        .update(updates)
        .returning('*');

      return updated[0];
    } catch (error) {
      logger.error('Error updating meeting link:', error);
      throw error;
    }
  }

  /**
   * Deactivate meeting link
   */
  async deactivateMeetingLink(meetingLinkId) {
    try {
      await db('meeting_links')
        .where('id', meetingLinkId)
        .update({ is_active: false });

      logger.info(`Meeting link ${meetingLinkId} deactivated`);
    } catch (error) {
      logger.error('Error deactivating meeting link:', error);
      throw error;
    }
  }

  /**
   * Clean up expired meeting links
   */
  async cleanupExpiredMeetings() {
    try {
      const expired = await db('meeting_links')
        .where('expires_at', '<', new Date())
        .where('is_active', true);

      for (const meeting of expired) {
        await this.deactivateMeetingLink(meeting.id);
      }

      logger.info(`Cleaned up ${expired.length} expired meeting links`);
    } catch (error) {
      logger.error('Error cleaning up expired meetings:', error);
      throw error;
    }
  }

  /**
   * Generate unique meeting ID
   */
  generateMeetingId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Generate meeting password
   */
  generatePassword() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * Generate Google Meet code
   */
  generateGoogleMeetCode() {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 3; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate Teams meeting code
   */
  generateTeamsCode() {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate Zoom JWT token
   */
  generateZoomJWT() {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      iss: this.zoomApiKey,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.zoomApiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Calculate expiry time for meeting link
   */
  calculateExpiryTime(startTime) {
    const start = new Date(startTime);
    const expiry = new Date(start.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after start
    return expiry;
  }

  /**
   * Validate meeting access
   */
  async validateMeetingAccess(meetingId, userId) {
    try {
      const meeting = await db('meeting_links')
        .join('bookings', 'meeting_links.booking_id', 'bookings.id')
        .where('meeting_links.meeting_id', meetingId)
        .where('meeting_links.is_active', true)
        .where('meeting_links.expires_at', '>', new Date())
        .first();

      if (!meeting) {
        return { valid: false, reason: 'Meeting not found or expired' };
      }

      // Check if user is authorized to join this meeting
      if (meeting.user_id !== userId && meeting.listener_id !== userId) {
        return { valid: false, reason: 'Unauthorized access' };
      }

      return { valid: true, meeting };
    } catch (error) {
      logger.error('Error validating meeting access:', error);
      return { valid: false, reason: 'Validation error' };
    }
  }
}

module.exports = new MeetingService();
