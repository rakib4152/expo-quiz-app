// Offline SQLite Database abstraction for mobile quiz sessions
// Mirrors Expo SQLite tables and transactions with local offline storage persistence.

import { api } from '../services/api/client.ts';
import type { Quiz, Question, Option, Difficulty } from '../../types/quiz.ts';

export interface OfflineQuizRecord {
  id: string;
  title: string;
  description: string;
  duration: number;
  totalQuestions: number;
  difficulty: Difficulty;
  downloadedAt: string;
}

export interface OfflineAttemptRecord {
  localId: string;
  quizId: string;
  quizTitle: string;
  startedAt: string;
  completedAt: string;
  timeTaken: number;
  status: 'SUBMITTED';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  answers: Array<{ questionId: string; optionId: string }>;
  localScore?: number;
  localPercentage?: number;
}

class MobileSqliteService {
  private STORAGE_PREFIX = 'quizpulse_sqlite_';

  private getTable<T>(table: string): T[] {
    try {
      const data = localStorage.getItem(`${this.STORAGE_PREFIX}${table}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private setTable<T>(table: string, items: T[]): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${table}`, JSON.stringify(items));
    } catch (e) {
      console.error(`Failed to write to sqlite table ${table}:`, e);
    }
  }

  // 1. Download quiz and its questions for offline use
  async downloadQuiz(quizId: string): Promise<boolean> {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        api.get<Quiz>(`/quizzes/${quizId}`),
        api.get<Question[]>(`/quizzes/${quizId}/questions`),
      ]);

      if (!quizRes.data || !questionsRes.data) return false;

      const quiz = quizRes.data;
      const questions = questionsRes.data;

      // Save to offline_quizzes
      const quizzes = this.getTable<OfflineQuizRecord>('quizzes');
      const filteredQuizzes = quizzes.filter((q) => q.id !== quiz.id);
      filteredQuizzes.push({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        totalQuestions: quiz.totalQuestions,
        difficulty: quiz.difficulty,
        downloadedAt: new Date().toISOString(),
      });
      this.setTable('quizzes', filteredQuizzes);

      // Save to offline_questions
      const currentQuestions = this.getTable<Question>('questions').filter((q) => !questions.some((newQ: Question) => newQ.id === q.id));
      this.setTable('questions', [...currentQuestions, ...questions]);

      return true;
    } catch (e) {
      console.error('Failed to download quiz offline:', e);
      return false;
    }
  }

  // Check if quiz is downloaded
  isQuizDownloaded(quizId: string): boolean {
    const quizzes = this.getTable<OfflineQuizRecord>('quizzes');
    return quizzes.some((q) => q.id === quizId);
  }

  // List downloaded quizzes
  getDownloadedQuizzes(): OfflineQuizRecord[] {
    return this.getTable<OfflineQuizRecord>('quizzes');
  }

  // Remove downloaded quiz
  removeDownloadedQuiz(quizId: string): void {
    const quizzes = this.getTable<OfflineQuizRecord>('quizzes').filter((q) => q.id !== quizId);
    this.setTable('quizzes', quizzes);
  }

  // Get questions for an offline quiz
  getOfflineQuestions(quizId: string): Question[] {
    // In our offline structure, questions can be retrieved
    const allQuestions = this.getTable<Question>('questions');
    return allQuestions;
  }

  // 2. Save offline attempt
  saveOfflineAttempt(attempt: Omit<OfflineAttemptRecord, 'syncStatus'>): OfflineAttemptRecord {
    const attempts = this.getTable<OfflineAttemptRecord>('attempts');
    const fullRecord: OfflineAttemptRecord = {
      ...attempt,
      syncStatus: 'pending',
    };
    attempts.unshift(fullRecord);
    this.setTable('attempts', attempts);
    return fullRecord;
  }

  getOfflineAttempts(): OfflineAttemptRecord[] {
    return this.getTable<OfflineAttemptRecord>('attempts');
  }

  getPendingAttempts(): OfflineAttemptRecord[] {
    return this.getTable<OfflineAttemptRecord>('attempts').filter((a) => a.syncStatus === 'pending');
  }

  // 3. Mark attempts synced after server sync returns
  markAttemptsSynced(syncedIds: string[]): void {
    const attempts = this.getTable<OfflineAttemptRecord>('attempts');
    const updated = attempts.map((att) => {
      if (syncedIds.includes(att.localId)) {
        return { ...att, syncStatus: 'synced' as const };
      }
      return att;
    });
    this.setTable('attempts', updated);
  }
}

export const sqliteDb = new MobileSqliteService();
