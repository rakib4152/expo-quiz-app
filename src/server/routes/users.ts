import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/v1/users/me/progress
router.get('/me/progress', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
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

  res.json({
    success: true,
    data: progress,
  });
});

// GET /api/v1/users/me/attempts
router.get('/me/attempts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const limit = parseInt(req.query.limit as string) || 20;

  const attempts = db.attempts
    .filter((a) => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map((att) => {
      const quiz = db.quizzes.find((q) => q.id === att.quizId);
      const subject = quiz?.subjectId ? db.getSubjectById(quiz.subjectId) : null;
      return {
        ...att,
        quizTitle: quiz?.title || 'Quiz',
        subjectName: subject?.name,
        subjectColor: subject?.color,
      };
    });

  res.json({
    success: true,
    data: attempts,
  });
});

// GET /api/v1/users/me/statistics
router.get('/me/statistics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const progress = db.progress.find((p) => p.userId === userId) || {
    totalQuizzesCompleted: 0,
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    averageScore: 0,
    streakDays: 1,
    lastActiveAt: new Date().toISOString(),
  };

  const userAttempts = db.attempts.filter((a) => a.userId === userId && a.status === 'SUBMITTED');
  const userAttemptIds = new Set(userAttempts.map((a) => a.id));
  const userAnswers = db.userAnswers.filter((ua) => userAttemptIds.has(ua.attemptId));

  // Subject breakdown
  const subjectPerformance = db.subjects.map((sub) => {
    const subjectQuestions = new Set(db.questions.filter((q) => q.subjectId === sub.id).map((q) => q.id));
    const answersInSubject = userAnswers.filter((ua) => subjectQuestions.has(ua.questionId));
    const correctCount = answersInSubject.filter((ua) => ua.isCorrect).length;
    const total = answersInSubject.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      color: sub.color,
      totalQuestions: total,
      correctAnswers: correctCount,
      accuracy,
    };
  });

  // Topic breakdown
  const topicPerformance = db.topics.map((top) => {
    const topicQuestions = new Set(db.questions.filter((q) => q.topicId === top.id).map((q) => q.id));
    const answersInTopic = userAnswers.filter((ua) => topicQuestions.has(ua.questionId));
    const correctCount = answersInTopic.filter((ua) => ua.isCorrect).length;
    const total = answersInTopic.length;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const subject = db.getSubjectById(top.subjectId);

    return {
      topicId: top.id,
      topicName: top.name,
      subjectName: subject?.name || 'General',
      totalQuestions: total,
      correctAnswers: correctCount,
      accuracy,
    };
  });

  const recentAttempts = userAttempts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((att) => {
      const quiz = db.quizzes.find((q) => q.id === att.quizId);
      return {
        ...att,
        quizTitle: quiz?.title || 'Quiz',
      };
    });

  res.json({
    success: true,
    data: {
      progress,
      subjectPerformance,
      topicPerformance,
      recentAttempts,
    },
  });
});

export default router;
