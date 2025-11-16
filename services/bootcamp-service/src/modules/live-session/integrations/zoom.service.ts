import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZoomIntegrationService {
  private readonly zoomApiUrl = 'https://api.zoom.us/v2';

  /**
   * Create Zoom meeting
   * Phase 3: Zoom integration
   */
  async createMeeting(data: {
    topic: string;
    startTime: Date;
    duration: number;
  }) {
    try {
      const response = await axios.post(
        `${this.zoomApiUrl}/users/me/meetings`,
        {
          topic: data.topic,
          type: 2, // Scheduled meeting
          start_time: data.startTime.toISOString(),
          duration: data.duration,
          timezone: 'UTC',
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
            auto_recording: 'cloud', // Auto-record to cloud
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ZOOM_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Zoom API Error:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  /**
   * Get meeting recordings
   */
  async getMeetingRecordings(meetingId: string) {
    try {
      const response = await axios.get(
        `${this.zoomApiUrl}/meetings/${meetingId}/recordings`,
        {
          headers: {
            Authorization: `Bearer ${process.env.ZOOM_ACCESS_TOKEN}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error('Zoom API Error:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom recordings');
    }
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId: string) {
    try {
      await axios.delete(`${this.zoomApiUrl}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${process.env.ZOOM_ACCESS_TOKEN}`,
        },
      });

      return { message: 'Meeting deleted successfully' };
    } catch (error) {
      console.error('Zoom API Error:', error.response?.data || error.message);
      throw new Error('Failed to delete Zoom meeting');
    }
  }
}
