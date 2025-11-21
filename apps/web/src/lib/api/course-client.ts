/**
 * Course API Client
 * Frontend Integration
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class CourseClient {
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

  // ===== COURSES =====
  async getCourses(filters?: {
    isPublished?: boolean;
    difficultyLevel?: string;
    search?: string;
    instructorId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { data } = await this.client.get('/courses', { params: filters });
    return data;
  }

  async getCourse(id: string) {
    const { data } = await this.client.get(`/courses/${id}`);
    return data;
  }

  async createCourse(course: any) {
    const { data } = await this.client.post('/courses', course);
    return data;
  }

  async updateCourse(id: string, course: any) {
    const { data } = await this.client.put(`/courses/${id}`, course);
    return data;
  }

  async deleteCourse(id: string) {
    const { data } = await this.client.delete(`/courses/${id}`);
    return data;
  }

  async publishCourse(id: string, isPublished: boolean) {
    const { data } = await this.client.put(`/courses/${id}/publish`, { isPublished });
    return data;
  }

  // ===== ENROLLMENTS =====
  async enrollInCourse(courseId: string) {
    const { data } = await this.client.post(`/courses/${courseId}/enroll`);
    return data;
  }

  async getMyEnrollments() {
    const { data } = await this.client.get('/courses/my/enrollments');
    return data;
  }

  async getCourseProgress(courseId: string) {
    const { data } = await this.client.get(`/courses/${courseId}/progress`);
    return data;
  }

  // ===== MODULES & LESSONS =====
  async getCourseModules(courseId: string) {
    const { data } = await this.client.get(`/courses/${courseId}/modules`);
    return data;
  }

  async completeLesson(lessonId: string) {
    const { data } = await this.client.post(`/courses/lessons/${lessonId}/complete`);
    return data;
  }

  // ===== REVIEWS =====
  async getCourseReviews(courseId: string) {
    const { data } = await this.client.get(`/courses/${courseId}/reviews`);
    return data;
  }

  async createReview(courseId: string, review: { rating: number; comment: string }) {
    const { data } = await this.client.post(`/courses/${courseId}/reviews`, review);
    return data;
  }
}

export const courseClient = new CourseClient();
export default courseClient;
