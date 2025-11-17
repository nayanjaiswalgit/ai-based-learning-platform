// Base API client with authentication support

const COURSE_SERVICE_URL = process.env.NEXT_PUBLIC_COURSE_SERVICE_URL || 'http://localhost:4001';
const ASSESSMENT_SERVICE_URL = process.env.NEXT_PUBLIC_ASSESSMENT_SERVICE_URL || 'http://localhost:3001';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers = {}, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...restOptions,
      headers: defaultHeaders,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || response.statusText,
        response.status,
        errorData,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
    );
  }
}

// Course API
export const courseApi = {
  // Courses
  createCourse: (data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getCourses: (params?: {
    skip?: number;
    take?: number;
    search?: string;
    instructorId?: string;
    difficulty?: string;
    isFree?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request(`${COURSE_SERVICE_URL}/api/v1/courses${query ? `?${query}` : ''}`);
  },

  getCourse: (id: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/courses/${id}`),

  updateCourse: (id: string, data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  publishCourse: (id: string, isPublished: boolean, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/courses/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublished }),
      token,
    }),

  deleteCourse: (id: string, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/courses/${id}`, {
      method: 'DELETE',
      token,
    }),

  getCourseAnalytics: (id: string, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/courses/${id}/analytics`, { token }),

  // Modules
  createModule: (data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getModules: (courseId: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/modules/course/${courseId}`),

  getModule: (id: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/modules/${id}`),

  updateModule: (id: string, data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteModule: (id: string, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/modules/${id}`, {
      method: 'DELETE',
      token,
    }),

  reorderModules: (data: { courseId: string; moduleIds: string[] }, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/modules/reorder`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  // Lessons
  createLesson: (data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getLessons: (moduleId: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/lessons/module/${moduleId}`),

  getLesson: (id: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/lessons/${id}`),

  updateLesson: (id: string, data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteLesson: (id: string, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/lessons/${id}`, {
      method: 'DELETE',
      token,
    }),

  updateProgress: (lessonId: string, data: any, token?: string) =>
    request(`${COURSE_SERVICE_URL}/api/v1/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),
};

// Assessment API
export const assessmentApi = {
  // Questions
  createQuestion: (data: any, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getQuestions: (params?: {
    difficulty?: string;
    type?: string;
    courseId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return request(`${ASSESSMENT_SERVICE_URL}/questions${query ? `?${query}` : ''}`);
  },

  getQuestion: (id: string, shuffle = false) =>
    request(`${ASSESSMENT_SERVICE_URL}/questions/${id}${shuffle ? '?shuffle=true' : ''}`),

  updateQuestion: (id: string, data: any, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/questions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  deleteQuestion: (id: string, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/questions/${id}`, {
      method: 'DELETE',
      token,
    }),

  checkAnswer: (id: string, data: { selectedAnswers: string[] }, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/questions/${id}/check-answer`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  // Quizzes
  createQuiz: (data: any, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getQuizzes: (courseId?: string) => {
    const query = courseId ? `?courseId=${courseId}` : '';
    return request(`${ASSESSMENT_SERVICE_URL}/quizzes${query}`);
  },

  getQuiz: (id: string, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/quizzes/${id}`, { token }),

  startQuiz: (id: string, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/quizzes/${id}/start`, {
      method: 'POST',
      token,
    }),

  submitQuiz: (attemptId: string, data: any, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/quizzes/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getQuizResults: (attemptId: string, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/quizzes/attempts/${attemptId}/results`, { token }),

  getAttemptHistory: (quizId: string, token?: string) =>
    request(`${ASSESSMENT_SERVICE_URL}/quizzes/${quizId}/attempts`, { token }),
};

// Certificate API
const CERTIFICATE_SERVICE_URL = process.env.NEXT_PUBLIC_CERTIFICATE_SERVICE_URL || 'http://localhost:3014';

export const certificateApi = {
  // Generate certificate
  createCertificate: (data: any, token?: string) =>
    request(`${CERTIFICATE_SERVICE_URL}/certificates`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  // Get user's certificates
  getUserCertificates: (userId: string, token?: string) =>
    request(`${CERTIFICATE_SERVICE_URL}/certificates/user/${userId}`, { token }),

  // Get single certificate
  getCertificate: (id: string, token?: string) =>
    request(`${CERTIFICATE_SERVICE_URL}/certificates/${id}`, { token }),

  // Verify certificate by verification code
  verifyCertificate: (verificationCode: string) =>
    request(`${CERTIFICATE_SERVICE_URL}/certificates/verify/${verificationCode}`),

  // Download certificate PDF
  downloadCertificate: (id: string, token?: string): string =>
    `${CERTIFICATE_SERVICE_URL}/certificates/${id}/download${token ? `?token=${token}` : ''}`,

  // Get certificate image URL
  getCertificateImage: (id: string): string =>
    `${CERTIFICATE_SERVICE_URL}/certificates/${id}/image`,

  // Revoke certificate (admin/instructor only)
  revokeCertificate: (id: string, reason: string, token?: string) =>
    request(`${CERTIFICATE_SERVICE_URL}/certificates/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      token,
    }),

  // Get course certificates
  getCourseCertificates: (courseId: string, token?: string) =>
    request(`${CERTIFICATE_SERVICE_URL}/certificates/course/${courseId}`, { token }),
};

export { ApiError };
