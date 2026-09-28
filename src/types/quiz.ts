// Shared Types for QuizPulse API and Client

export type Role = 'USER' | 'ADMIN';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
export type AttemptStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color: string;
  topicsCount?: number;
  questionsCount?: number;
  quizzesCount?: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  description?: string;
  order: number;
  questionsCount?: number;
  quizzesCount?: number;
  createdAt: string;
}

export interface Option {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect?: boolean; // Securely omitted during active quiz attempts!
}

export interface Question {
  id: string;
  subjectId: string;
  topicId?: string | null;
  questionText: string;
  explanation?: string; // Omitted during active quiz attempts
  difficulty: Difficulty;
  questionType: QuestionType;
  options: Option[];
  subjectName?: string;
  topicName?: string;
  createdAt: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  subjectId?: string | null;
  topicId?: string | null;
  subject?: Subject;
  topic?: Topic;
  duration: number; // in minutes
  totalQuestions: number;
  difficulty: Difficulty;
  isPublished: boolean;
  userBestScore?: number | null;
  createdAt: string;
}

export interface QuizAttemptAnswerInput {
  questionId: string;
  optionId: string;
}

export interface QuizAttemptStartResponse {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  duration: number;
  startedAt: string;
  expiresAt: string;
  totalQuestions: number;
  questions: Array<{
    id: string;
    questionText: string;
    difficulty: Difficulty;
    options: Array<{
      id: string;
      optionText: string;
    }>;
  }>;
}

export interface QuestionReviewItem {
  questionId: string;
  questionText: string;
  explanation: string;
  difficulty: Difficulty;
  selectedOptionId: string | null;
  selectedOptionText: string | null;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  options: Array<{
    id: string;
    optionText: string;
    isCorrect: boolean;
  }>;
  isBookmarked?: boolean;
}

export interface QuizAttemptResult {
  attemptId: string;
  quizId: string;
  quizTitle: string;
  userId: string;
  startedAt: string;
  completedAt: string;
  status: AttemptStatus;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  score: number;
  percentage: number;
  timeTaken: number; // in seconds
  questions?: QuestionReviewItem[];
}

export interface BookmarkItem {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
  question: Question;
}

export interface UserProgressData {
  totalQuizzesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  streakDays: number;
  lastActiveAt: string;
}

export interface SubjectPerformance {
  subjectId: string;
  subjectName: string;
  color?: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  subjectName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface UserStatistics {
  progress: UserProgressData;
  subjectPerformance: SubjectPerformance[];
  topicPerformance: TopicPerformance[];
  recentAttempts: QuizAttemptResult[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  quizzesCompleted: number;
  totalScore: number;
  averageScore: number;
  accuracy: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    nextCursor?: string | null;
    hasNextPage?: boolean;
    total?: number;
    page?: number;
    limit?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
