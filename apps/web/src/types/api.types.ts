// API Types for Course and Assessment Services

// Course Types
export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  longDescription?: string;
  instructorId: string;
  instructor?: {
    id: string;
    username: string;
    fullName: string;
    profile?: {
      avatarUrl?: string;
    };
  };
  difficultyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDurationHours?: number;
  price: number;
  isPublished: boolean;
  isFree: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  language: string;
  ratingAverage: number;
  ratingCount: number;
  enrollmentCount: number;
  modules?: CourseModule[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  lessons?: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  contentType: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'CODING' | 'LAB';
  contentUrl?: string;
  contentText?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFreePreview: boolean;
  videoTranscript?: string;
  createdAt: string;
  updatedAt: string;
}

// Assessment Types
export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'MULTIPLE_SELECT'
  | 'TRUE_FALSE'
  | 'FILL_IN_BLANK'
  | 'CODE_OUTPUT';

export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface AnswerOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
  orderIndex?: number;
}

export interface Question {
  id: string;
  questionType: QuestionType;
  title: string;
  description?: string;
  difficulty?: DifficultyLevel;
  topics?: string[];
  companyTags?: string[];
  options: AnswerOption[];
  explanation?: string;
  timeLimit?: number;
  points?: number;
  courseId?: string;
  createdBy?: string;
  isPublic: boolean;
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  questionIds: string[];
  timeLimit: number; // in seconds
  passingPercentage: number;
  randomizeQuestions: boolean;
  shuffleAnswers: boolean;
  showResultsImmediately: boolean;
  maxAttempts: number;
  courseId?: string;
  availableFrom?: string;
  availableUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number;
  score?: number;
  isPassed?: boolean;
  answers?: QuestionAnswer[];
}

export interface QuestionAnswer {
  questionId: string;
  selectedAnswers: string[];
  timeSpent: number;
  isCorrect?: boolean;
  earnedPoints?: number;
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  isPassed: boolean;
  timeSpent: number;
  answers: {
    question: Question;
    selectedAnswers: string[];
    correctAnswers: string[];
    isCorrect: boolean;
    earnedPoints: number;
    timeSpent: number;
  }[];
}

// Request Types
export interface CreateCourseRequest {
  title: string;
  description?: string;
  longDescription?: string;
  instructorId: string;
  difficultyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  estimatedDurationHours?: number;
  price: number;
  isPublished?: boolean;
  isFree?: boolean;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  language?: string;
  skillIds?: string[];
}

export interface CreateModuleRequest {
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
}

export interface CreateLessonRequest {
  moduleId: string;
  title: string;
  contentType: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'CODING' | 'LAB';
  contentUrl?: string;
  contentText?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFreePreview?: boolean;
  videoTranscript?: string;
}

export interface CreateQuestionRequest {
  questionText: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  options: {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  explanation?: string;
  tags?: string[];
  courseId?: string;
  timeLimit?: number;
  points?: number;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  questionIds: string[];
  timeLimit: number;
  passingPercentage: number;
  randomizeQuestions?: boolean;
  shuffleAnswers?: boolean;
  showResultsImmediately?: boolean;
  maxAttempts?: number;
  courseId?: string;
  availableFrom?: string;
  availableUntil?: string;
}

export interface SubmitQuizRequest {
  answers: {
    questionId: string;
    selectedAnswers: string[];
    timeSpent: number;
  }[];
  totalTime: number;
}

// Certificate Types
export type CertificateType = 'COURSE' | 'BOOTCAMP' | 'QUIZ' | 'ACHIEVEMENT';

export interface Certificate {
  id: string;
  verificationCode: string;
  userId: string;
  certificateType: CertificateType;
  courseId?: string;
  cohortId?: string;
  recipientName: string;
  title: string;
  description?: string;
  issuer: string;
  issuedAt: string;
  completedAt: string;
  expiresAt?: string;
  grade?: string;
  score?: number;
  duration?: number;
  skills?: string[];
  pdfUrl?: string;
  imageUrl?: string;
  templateId: string;
  digitalSignature?: string;
  blockchainTxHash?: string;
  isRevoked: boolean;
  revokedAt?: string;
  revokeReason?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface CreateCertificateRequest {
  userId: string;
  certificateType: CertificateType;
  courseId?: string;
  cohortId?: string;
  recipientName: string;
  title: string;
  description?: string;
  completedAt: string;
  grade?: string;
  score?: number;
  duration?: number;
  skills?: string[];
  templateId?: string;
  expiresAt?: string;
}

export interface VerifyCertificateResponse {
  isValid: boolean;
  certificate?: Certificate;
  error?: string;
}
