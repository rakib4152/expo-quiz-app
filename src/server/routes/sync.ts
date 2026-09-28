import { Router, Response } from 'express';
import { db, DbQuizAttempt, DbUserAnswer } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// POST /api/v1/sync/attempts
// Syncs attempts created/completed while offline
router.post('/attempts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const { offlineAttempts } = req.body;

  if (!Array.isArray(offlineAttempts)) {
    res.status(422).json({
      success: false,
      error: { code: 'INVALID_PAYLOAD', message: 'offlineAttempts array is required' },
    });
    return;
  }

  const results: any[] = [];

  for (const item of offlineAttempts) {
    const { localId, quizId, startedAt, completedAt, timeTaken, answers } = item;

    // Idempotency: check if already exists
    const existing = db.attempts.find((a) => a.id === localId && a.userId === userId);
    if (existing && existing.status === 'SUBMITTED') {
      results.push({
        localId,
        status: 'synced',
        serverAttemptId: existing.id,
        score: existing.score,
        percentage: existing.percentage,
      });
      continue;
    }

    const quiz = db.quizzes.find((q) => q.id === quizId);
    if (!quiz) {
      results.push({
        localId,
        status: 'error',
        message: 'Quiz not found on server',
      });
      continue;
    }

    const questions = db.getQuestionsByQuizId(quizId);
    let correctCount = 0;
    let incorrectCount = 0;
    let answeredCount = 0;

    const attemptId = localId || `att_sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const userAnswersList = Array.isArray(answers) ? answers : [];

    for (const q of questions) {
      const userAns = userAnswersList.find((a: any) => a.questionId === q.id);
      if (userAns && userAns.optionId) {
        answeredCount++;
        const option = db.options.find((o) => o.id === userAns.optionId && o.questionId === q.id);
        const isCorrect = option ? option.isCorrect : false;

        if (isCorrect) correctCount++;
        else incorrectCount++;

        db.userAnswers.push({
          id: `ua_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          attemptId,
          questionId: q.id,
          optionId: userAns.optionId,
          isCorrect,
          createdAt: completedAt || new Date().toISOString(),
        });
      }
    }

    const totalQuestions = questions.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const score = correctCount * 10;

    const newAttempt: DbQuizAttempt = {
      id: attemptId,
      userId,
      quizId,
      startedAt: startedAt || new Date().toISOString(),
      expiresAt: new Date(Date.now() + quiz.duration * 60 * 1000).toISOString(),
      completedAt: completedAt || new Date().toISOString(),
      status: 'SUBMITTED',
      totalQuestions,
      answeredQuestions: answeredCount,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      score,
      percentage,
      timeTaken: timeTaken || 60,
      createdAt: startedAt || new Date().toISOString(),
      updatedAt: completedAt || new Date().toISOString(),
    };

    db.attempts.push(newAttempt);

    // Update progress
    let progress = db.progress.find((p) => p.userId === userId);
    if (!progress) {
      progress = {
        id: `prog_${userId}`,
        userId,
        totalQuizzesCompleted: 0,
        totalQuestionsAnswered: 0,
        correctAnswers: 0,
        averageScore: 0,
        streakDays: 1,
        lastActiveAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.progress.push(progress);
    }

    const userSubmitted = db.attempts.filter((a) => a.userId === userId && a.status === 'SUBMITTED');
    progress.totalQuizzesCompleted = userSubmitted.length;
    progress.totalQuestionsAnswered = userSubmitted.reduce((s, a) => s + a.answeredQuestions, 0);
    progress.correctAnswers = userSubmitted.reduce((s, a) => s + a.correctAnswers, 0);
    const avg = userSubmitted.reduce((s, a) => s + a.percentage, 0) / userSubmitted.length;
    progress.averageScore = Math.round(avg * 10) / 10;
    progress.lastActiveAt = new Date().toISOString();

    results.push({
      localId,
      status: 'synced',
      serverAttemptId: attemptId,
      score,
      percentage,
      correctAnswers: correctCount,
      totalQuestions,
    });
  }

  res.json({
    success: true,
    data: {
      syncedCount: results.filter((r) => r.status === 'synced').length,
      results,
    },
  });
});

export default router;
