/**
 * Bootcamp & Cohort API Client
 * Agent 9 - Frontend Integration
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class BootcampClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ===== BOOTCAMPS =====
  async getBootcamps(filters?: {
    isPublished?: boolean;
    difficultyLevel?: string;
    search?: string;
  }) {
    const { data } = await this.client.get('/bootcamps', { params: filters });
    return data;
  }

  async getBootcamp(id: string) {
    const { data } = await this.client.get(`/bootcamps/${id}`);
    return data;
  }

  async createBootcamp(bootcamp: any) {
    const { data } = await this.client.post('/bootcamps', bootcamp);
    return data;
  }

  async applyToBootcamp(application: any) {
    const { data } = await this.client.post('/bootcamps/apply', application);
    return data;
  }

  async getMyApplications() {
    const { data } = await this.client.get('/bootcamps/my/applications');
    return data;
  }

  // ===== COHORTS =====
  async getCohorts(bootcampId: string) {
    const { data } = await this.client.get(`/cohorts/bootcamp/${bootcampId}`);
    return data;
  }

  async getCohort(cohortId: string) {
    const { data } = await this.client.get(`/cohorts/${cohortId}`);
    return data;
  }

  async getCohortDashboard(cohortId: string) {
    const { data } = await this.client.get(`/cohorts/${cohortId}/dashboard`);
    return data;
  }

  async enrollInCohort(cohortId: string) {
    const { data } = await this.client.post(`/cohorts/${cohortId}/enroll`);
    return data;
  }

  async getCohortMessages(cohortId: string, limit = 50, offset = 0) {
    const { data } = await this.client.get(`/cohorts/${cohortId}/messages`, {
      params: { limit, offset },
    });
    return data;
  }

  async sendCohortMessage(cohortId: string, messageText: string) {
    const { data } = await this.client.post(`/cohorts/${cohortId}/messages`, {
      messageText,
    });
    return data;
  }

  // ===== LIVE SESSIONS =====
  async getLiveSessions(cohortId: string, upcoming = true) {
    const { data } = await this.client.get(`/live-sessions/cohort/${cohortId}`, {
      params: { upcoming },
    });
    return data;
  }

  async getSession(sessionId: string) {
    const { data } = await this.client.get(`/live-sessions/${sessionId}`);
    return data;
  }

  async getSessionRecording(sessionId: string) {
    const { data } = await this.client.get(`/live-sessions/${sessionId}/recording`);
    return data;
  }

  // ===== 1:1 MEETINGS =====
  async getMentorAvailability(mentorId: string) {
    const { data } = await this.client.get(`/one-on-one-meetings/availability/${mentorId}`);
    return data;
  }

  async bookMeeting(meeting: {
    mentorId: string;
    scheduledAt: Date;
    durationMinutes?: number;
    agenda?: string;
  }) {
    const { data } = await this.client.post('/one-on-one-meetings/book', meeting);
    return data;
  }

  async getMyMeetings(role: 'mentor' | 'student', upcoming = true) {
    const { data } = await this.client.get('/one-on-one-meetings/my-meetings', {
      params: { role, upcoming },
    });
    return data;
  }

  async cancelMeeting(meetingId: string) {
    const { data } = await this.client.put(`/one-on-one-meetings/${meetingId}/cancel`);
    return data;
  }

  // ===== ASSIGNMENTS =====
  async getAssignments(cohortId: string) {
    const { data } = await this.client.get(`/assignments/cohort/${cohortId}`);
    return data;
  }

  async getAssignment(assignmentId: string) {
    const { data } = await this.client.get(`/assignments/${assignmentId}`);
    return data;
  }

  async submitAssignment(assignmentId: string, submission: {
    submissionUrl?: string;
    submissionText?: string;
    files?: any;
  }) {
    const { data } = await this.client.post(`/assignments/${assignmentId}/submit`, submission);
    return data;
  }

  async getMySubmissions(cohortId?: string) {
    const { data } = await this.client.get('/assignments/my/submissions', {
      params: { cohortId },
    });
    return data;
  }

  async submitPeerReview(submissionId: string, review: {
    rating: number;
    feedback: string;
  }) {
    const { data } = await this.client.post(
      `/assignments/submissions/${submissionId}/peer-review`,
      review
    );
    return data;
  }

  // ===== PROJECT SHOWCASE =====
  async getProjectShowcases(cohortId: string) {
    const { data } = await this.client.get(`/assignments/cohort/${cohortId}/showcases`);
    return data;
  }

  async createProjectShowcase(cohortId: string, project: any) {
    const { data } = await this.client.post(`/assignments/cohort/${cohortId}/showcase`, project);
    return data;
  }

  async likeProject(projectId: string) {
    const { data } = await this.client.put(`/assignments/showcases/${projectId}/like`);
    return data;
  }

  // ===== CERTIFICATES =====
  async getMyCertificates() {
    const { data } = await this.client.get('/certificates/my/certificates');
    return data;
  }

  async getCertificate(certificateId: string) {
    const { data } = await this.client.get(`/certificates/${certificateId}`);
    return data;
  }

  async verifyCertificate(certificateNumber: string) {
    const { data } = await this.client.get(`/certificates/verify/${certificateNumber}`);
    return data;
  }

  async downloadCertificate(certificateId: string) {
    const { data } = await this.client.get(`/certificates/${certificateId}/download`);
    return data;
  }

  async getLinkedInShareUrl(certificateId: string) {
    const { data } = await this.client.get(`/certificates/${certificateId}/linkedin-share`);
    return data;
  }
}

export const bootcampClient = new BootcampClient();
export default bootcampClient;
