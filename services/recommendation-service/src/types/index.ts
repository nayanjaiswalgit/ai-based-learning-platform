// ============================================================================
// SHARED TYPES FOR AI & PERSONALIZATION SERVICE
// ============================================================================

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum LearningGoal {
  WEB_DEVELOPMENT = 'WEB_DEVELOPMENT',
  DATA_SCIENCE = 'DATA_SCIENCE',
  MACHINE_LEARNING = 'MACHINE_LEARNING',
  MOBILE_DEVELOPMENT = 'MOBILE_DEVELOPMENT',
  DEVOPS = 'DEVOPS',
  CLOUD_COMPUTING = 'CLOUD_COMPUTING',
  CYBERSECURITY = 'CYBERSECURITY',
  GAME_DEVELOPMENT = 'GAME_DEVELOPMENT',
  BLOCKCHAIN = 'BLOCKCHAIN',
  SYSTEM_DESIGN = 'SYSTEM_DESIGN',
}

export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

// ============================================================================
// SKILL ASSESSMENT TYPES
// ============================================================================

export interface SkillAssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  topic: string;
  difficulty: DifficultyLevel;
  explanation: string;
}

export interface SkillAssessmentResult {
  userId: string;
  assessmentId: string;
  score: number;
  totalQuestions: number;
  skillLevel: SkillLevel;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  completedAt: Date;
}

export interface SkillGap {
  skill: string;
  currentLevel: SkillLevel;
  targetLevel: SkillLevel;
  gap: number;
  suggestedResources: Resource[];
}

export interface Resource {
  id: string;
  type: 'COURSE' | 'PROBLEM' | 'ARTICLE' | 'VIDEO';
  title: string;
  url?: string;
  estimatedTime: number; // in minutes
  difficulty: DifficultyLevel;
}

// ============================================================================
// ROADMAP TYPES
// ============================================================================

export interface Roadmap {
  id: string;
  userId: string;
  goal: LearningGoal;
  title: string;
  description: string;
  totalDuration: number; // in weeks
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  phase: number;
  weekStart: number;
  weekEnd: number;
  tasks: Task[];
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'COURSE' | 'PROBLEM' | 'PROJECT' | 'READING';
  resourceId?: string;
  estimatedHours: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface RoadmapGenerationRequest {
  userId: string;
  goal: LearningGoal;
  currentSkillLevel: SkillLevel;
  availableHoursPerWeek: number;
  preferredLearningStyle?: 'VISUAL' | 'READING' | 'HANDS_ON' | 'MIXED';
  specificInterests?: string[];
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export interface DailyRecommendation {
  userId: string;
  date: Date;
  challenge: Challenge;
  courses: CourseRecommendation[];
  problems: ProblemRecommendation[];
  motivationalMessage: string;
  streakCount: number;
}

export interface Challenge {
  id: string;
  type: 'CODING' | 'MCQ' | 'SYSTEM_DESIGN';
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTime: number;
  points: number;
}

export interface CourseRecommendation {
  courseId: string;
  title: string;
  reason: string;
  matchScore: number; // 0-100
  estimatedCompletionTime: number;
}

export interface ProblemRecommendation {
  problemId: string;
  title: string;
  difficulty: DifficultyLevel;
  topics: string[];
  reason: string;
  successProbability: number; // 0-1
}

// ============================================================================
// AI CHATBOT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  timestamp: Date;
  context?: ChatContext;
}

export interface ChatContext {
  currentCourse?: string;
  currentProblem?: string;
  userProgress?: UserProgress;
  recentActivity?: Activity[];
}

export interface UserProgress {
  coursesCompleted: number;
  problemsSolved: number;
  currentStreak: number;
  skillLevels: Record<string, SkillLevel>;
}

export interface Activity {
  type: string;
  resourceId: string;
  timestamp: Date;
  duration: number;
}

export interface ChatRequest {
  userId: string;
  message: string;
  context?: Partial<ChatContext>;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  resources?: Resource[];
  code?: string;
}

// ============================================================================
// VECTOR SEARCH TYPES
// ============================================================================

export interface VectorSearchQuery {
  query: string;
  topK?: number;
  filter?: VectorFilter;
}

export interface VectorFilter {
  difficulty?: DifficultyLevel[];
  topics?: string[];
  type?: string[];
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata: SearchMetadata;
}

export interface SearchMetadata {
  title: string;
  description: string;
  type: string;
  difficulty?: DifficultyLevel;
  topics?: string[];
  url?: string;
}

// ============================================================================
// LEARNING ANALYTICS TYPES
// ============================================================================

export interface LearningAnalytics {
  userId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  patterns: LearningPattern[];
  optimalLearningTimes: TimeSlot[];
  topicStrengths: TopicAnalysis[];
  topicWeaknesses: TopicAnalysis[];
  predictions: Prediction[];
  studyPlan: StudyPlan;
}

export interface LearningPattern {
  type: 'TIME_OF_DAY' | 'DAY_OF_WEEK' | 'SESSION_LENGTH' | 'TOPIC_PREFERENCE';
  pattern: string;
  confidence: number;
  recommendation: string;
}

export interface TimeSlot {
  dayOfWeek?: number;
  hourOfDay: number;
  avgPerformance: number;
  avgFocusTime: number;
}

export interface TopicAnalysis {
  topic: string;
  skillLevel: SkillLevel;
  problemsSolved: number;
  successRate: number;
  avgTimePerProblem: number;
  trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
}

export interface Prediction {
  type: 'SUCCESS_RATE' | 'COMPLETION_TIME' | 'SKILL_LEVEL';
  target: string;
  value: number;
  confidence: number;
}

export interface StudyPlan {
  weeklyGoal: number; // hours
  dailyRecommendations: DailyStudyRecommendation[];
  focusAreas: string[];
  reviewTopics: string[];
}

export interface DailyStudyRecommendation {
  day: string;
  recommendedHours: number;
  topics: string[];
  activities: string[];
}
