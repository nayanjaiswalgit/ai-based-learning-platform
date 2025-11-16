import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleMeetIntegrationService {
  private calendar;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  /**
   * Create Google Meet meeting
   * Phase 3: Google Meet integration
   */
  async createMeeting(data: {
    summary: string;
    startTime: Date;
    duration: number;
  }) {
    try {
      const endTime = new Date(data.startTime.getTime() + data.duration * 60000);

      const event = {
        summary: data.summary,
        description: 'Live session for cohort',
        start: {
          dateTime: data.startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      });

      return response.data;
    } catch (error) {
      console.error('Google Calendar API Error:', error.message);
      throw new Error('Failed to create Google Meet meeting');
    }
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return { message: 'Meeting deleted successfully' };
    } catch (error) {
      console.error('Google Calendar API Error:', error.message);
      throw new Error('Failed to delete Google Meet meeting');
    }
  }
}
