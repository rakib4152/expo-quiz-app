// Analytics & Leaderboard Microservice
// Port 4004 equivalent - Processes async attempt events, manages streaks, subject-wise analytics, and rankings

import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import { requireAuth, AuthenticatedRequest } from '../../auth.ts';
import { eventBus } from '../../events/eventBus.ts';

export const analyticsMicroservice = Router();

// Subscribed to EventBus: Updates user progress asynchronously when a quiz is submitted
eventBus.subscribe('EXAM_ATTEMPT_SUBMITTED', (event) => {
  const { userId } = event.payload;
  let progress = db.progress.find((p) => p.userId === userId);
  const now = new Date().toISOString();

  if (!progress) {
    progress = {
      id: `prog_${userId}`,
      userId,
      totalQuizzesCompleted: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      averageScore: 0,
      streakDays: 1,
      lastActiveAt: now,
      updatedAt: now,
    };
    db.progress.push(progress);
  }

  const userSubmitted = db.attempts.filter((a) => a.userId === userId && a.status === 'SUBMITTED');
  progress.totalQuizzesCompleted = userSubmitted.length;
  progress.totalQuestionsAnswered = userSubmitted.reduce((s, a) => s + a.answeredQuestions, 0);
  progress.correctAnswers = userSubmitted.reduce((s, a) => s + a.correctAnswers, 0);
  const avg = userSubmitted.reduce((s, a) => s + a.percentage, 0) / userSubmitted.length;
  progress.averageScore = Math.round(avg * 10) / 10;
  progress.lastActiveAt = now;
  progress.updatedAt = now;
});

// GET /users/me/progress
analyticsMicroservice.get('/users/me/progress', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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

// GET /users/me/attempts
analyticsMicroservice.get('/users/me/attempts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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

// GET /users/me/statistics
analyticsMicroservice.get('/users/me/statistics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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

// GET /leaderboard
analyticsMicroservice.get('/leaderboard', (req: Request, res: Response) => {
  const timeframe = (req.query.timeframe as string) || 'all-time';

  const entries = db.users
    .map((user) => {
      const prog = db.progress.find((p) => p.userId === user.id);
      const attempts = db.attempts.filter((a) => a.userId === user.id && a.status === 'SUBMITTED');

      const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
      const quizzesCompleted = attempts.length;
      const totalQuestionsAnswered = prog?.totalQuestionsAnswered || 0;
      const correctAnswers = prog?.correctAnswers || 0;
      const accuracy = totalQuestionsAnswered > 0 ? Math.round((correctAnswers / totalQuestionsAnswered) * 100) : 0;
      const averageScore = prog?.averageScore || 0;

      return {
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatarUrl,
        quizzesCompleted,
        totalScore,
        averageScore,
        accuracy,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore || b.accuracy - a.accuracy)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  res.json({
    success: true,
    data: {
      timeframe,
      leaderboard: entries,
    },
  });
});
