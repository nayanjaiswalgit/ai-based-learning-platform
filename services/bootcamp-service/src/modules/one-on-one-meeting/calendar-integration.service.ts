import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarIntegrationService {
  private calendar;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create calendar event with video conferencing
   * Phase 4: Calendar integration (Google Calendar, Outlook)
   */
  async createEvent(data: {
    summary: string;
    startTime: Date;
    duration: number;
    attendees: string[];
    provider: 'zoom' | 'google_meet';
  }) {
    try {
      const endTime = new Date(data.startTime.getTime() + data.duration * 60000);

      const event = {
        summary: data.summary,
        start: {
          dateTime: data.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        attendees: data.attendees.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
        sendUpdates: 'all',
      });

      return {
        id: response.data.id,
        meetingLink: response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri,
      };
    } catch (error) {
      console.error('Calendar API Error:', error.message);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(eventId: string, updates: any) {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updates,
        sendUpdates: 'all',
      });

      return response.data;
    } catch (error) {
      console.error('Calendar API Error:', error.message);
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });

      return { message: 'Event deleted successfully' };
    } catch (error) {
      console.error('Calendar API Error:', error.message);
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get available time slots for a user
   */
  async getAvailableSlots(userId: string, startDate: Date, endDate: Date) {
    try {
      const response = await this.calendar.freebusy.query({
        requestBody: {
          timeMin: startDate.toISOString(),
          timeMax: endDate.toISOString(),
          items: [{ id: userId }],
        },
      });

      return response.data.calendars?.[userId]?.busy || [];
    } catch (error) {
      console.error('Calendar API Error:', error.message);
      return [];
    }
  }
}
