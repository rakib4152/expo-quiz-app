// Exam Taking & Scoring Engine Microservice
// Port 4003 equivalent - Manages active attempts, server-side grading, timer enforcement, and offline sync

import { Router, Response } from 'express';
import { db, DbQuizAttempt, DbUserAnswer } from '../../db.ts';
import { requireAuth, AuthenticatedRequest } from '../../auth.ts';
import { eventBus } from '../../events/eventBus.ts';

export const examMicroservice = Router();

// POST /quizzes/:id/start
examMicroservice.post('/quizzes/:id/start', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) {
    res.status(404).json({
      success: false,
      error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' },
    });
    return;
  }

  const userId = req.userId!;
  const questions = db.getQuestionsByQuizId(quiz.id);

  if (questions.length === 0) {
    res.status(400).json({
      success: false,
      error: { code: 'EMPTY_QUIZ', message: 'This quiz has no questions yet.' },
    });
    return;
  }

  const existingAttempt = db.attempts.find(
    (a) => a.userId === userId && a.quizId === quiz.id && a.status === 'IN_PROGRESS' && new Date(a.expiresAt).getTime() > Date.now()
  );

  const now = new Date();
  let attempt: DbQuizAttempt;

  if (existingAttempt) {
    attempt = existingAttempt;
  } else {
    const expiresAt = new Date(now.getTime() + quiz.duration * 60 * 1000);
    attempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      quizId: quiz.id,
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      completedAt: null,
      status: 'IN_PROGRESS',
      totalQuestions: questions.length,
      answeredQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0,
      percentage: 0,
      timeTaken: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    db.attempts.push(attempt);
  }

  // Sanitize questions: strictly strip isCorrect and explanation
  const sanitizedQuestions = questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    difficulty: q.difficulty,
    options: db.getOptionsByQuestionId(q.id).map((o) => ({
      id: o.id,
      optionText: o.optionText,
    })),
  }));

  res.status(201).json({
    success: true,
    data: {
      attemptId: attempt.id,
      quizId: quiz.id,
      quizTitle: quiz.title,
      duration: quiz.duration,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      totalQuestions: questions.length,
      questions: sanitizedQuestions,
    },
  });
});

// POST /quizzes/:id/submit
// Server-authoritative scoring engine
examMicroservice.post('/quizzes/:id/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { attemptId, answers } = req.body;
  const userId = req.userId!;

  if (!attemptId) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'attemptId is required' },
    });
    return;
  }

  const attempt = db.attempts.find((a) => a.id === attemptId && a.userId === userId);
  if (!attempt) {
    res.status(404).json({
      success: false,
      error: { code: 'ATTEMPT_NOT_FOUND', message: 'Quiz attempt not found or does not belong to you.' },
    });
    return;
  }

  if (attempt.status === 'SUBMITTED') {
    res.status(409).json({
      success: false,
      error: { code: 'ALREADY_SUBMITTED', message: 'This quiz attempt has already been submitted.' },
    });
    return;
  }

  const quiz = db.quizzes.find((q) => q.id === attempt.quizId);
  const questions = db.getQuestionsByQuizId(attempt.quizId);
  const userAnswersList: Array<{ questionId: string; optionId: string }> = Array.isArray(answers) ? answers : [];

  const now = new Date();
  const startedTime = new Date(attempt.startedAt).getTime();
  const timeTaken = Math.max(1, Math.min(Math.round((now.getTime() - startedTime) / 1000), quiz ? quiz.duration * 60 : 3600));

  let correctCount = 0;
  let incorrectCount = 0;
  let answeredCount = 0;

  db.userAnswers = db.userAnswers.filter((ua) => ua.attemptId !== attempt.id);

  for (const q of questions) {
    const userAnswer = userAnswersList.find((ans) => ans.questionId === q.id);
    if (userAnswer && userAnswer.optionId) {
      answeredCount++;
      const option = db.options.find((o) => o.id === userAnswer.optionId && o.questionId === q.id);
      const isCorrect = option ? option.isCorrect : false;

      if (isCorrect) correctCount++;
      else incorrectCount++;

      const dbAns: DbUserAnswer = {
        id: `ua_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        attemptId: attempt.id,
        questionId: q.id,
        optionId: userAnswer.optionId,
        isCorrect,
        createdAt: now.toISOString(),
      };
      db.userAnswers.push(dbAns);
    }
  }

  const totalQuestions = questions.length;
  const unansweredCount = totalQuestions - answeredCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const score = correctCount * 10;

  attempt.status = 'SUBMITTED';
  attempt.completedAt = now.toISOString();
  attempt.totalQuestions = totalQuestions;
  attempt.answeredQuestions = answeredCount;
  attempt.correctAnswers = correctCount;
  attempt.incorrectAnswers = incorrectCount;
  attempt.score = score;
  attempt.percentage = percentage;
  attempt.timeTaken = timeTaken;
  attempt.updatedAt = now.toISOString();

  // Asynchronous Event: Notify Analytics Microservice to update leaderboards & progress
  eventBus.publish({
    id: `evt_att_${attempt.id}`,
    type: 'EXAM_ATTEMPT_SUBMITTED',
    sourceService: 'exam-service',
    timestamp: now.toISOString(),
    payload: {
      userId,
      attemptId: attempt.id,
      quizId: attempt.quizId,
      score,
      percentage,
      correctAnswers: correctCount,
      totalQuestions,
      timeTaken,
    },
  });

  res.json({
    success: true,
    data: {
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizTitle: quiz?.title || 'Quiz',
      score,
      percentage,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      totalQuestions,
      timeTaken,
      completedAt: attempt.completedAt,
    },
  });
});

// GET /attempts/:id
// Solution review with verified explanations
examMicroservice.get('/attempts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const attempt = db.attempts.find((a) => a.id === req.params.id && a.userId === userId);

  if (!attempt) {
    res.status(404).json({
      success: false,
      error: { code: 'ATTEMPT_NOT_FOUND', message: 'Attempt not found or unauthorized' },
    });
    return;
  }

  const quiz = db.quizzes.find((q) => q.id === attempt.quizId);
  const questions = db.getQuestionsByQuizId(attempt.quizId);
  const userAnswers = db.userAnswers.filter((ua) => ua.attemptId === attempt.id);

  let reviewQuestions: any[] = [];
  if (attempt.status === 'SUBMITTED') {
    reviewQuestions = questions.map((q) => {
      const options = db.getOptionsByQuestionId(q.id);
      const correctOption = options.find((o) => o.isCorrect);
      const userAns = userAnswers.find((ua) => ua.questionId === q.id);
      const selectedOption = userAns ? options.find((o) => o.id === userAns.optionId) : null;
      const isBookmarked = db.isBookmarked(userId, q.id);

      return {
        questionId: q.id,
        questionText: q.questionText,
        explanation: q.explanation,
        difficulty: q.difficulty,
        selectedOptionId: selectedOption?.id || null,
        selectedOptionText: selectedOption?.optionText || null,
        correctOptionId: correctOption?.id || '',
        correctOptionText: correctOption?.optionText || '',
        isCorrect: userAns ? userAns.isCorrect : false,
        isBookmarked,
        options: options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
      };
    });
  }

  const unanswered = attempt.totalQuestions - attempt.answeredQuestions;

  res.json({
    success: true,
    data: {
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizTitle: quiz?.title || 'Quiz',
      userId: attempt.userId,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      status: attempt.status,
      totalQuestions: attempt.totalQuestions,
      answeredQuestions: attempt.answeredQuestions,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      unansweredQuestions: unanswered,
      score: attempt.score,
      percentage: attempt.percentage,
      timeTaken: attempt.timeTaken,
      questions: reviewQuestions,
    },
  });
});

// POST /sync/attempts
// Batch sync for offline attempts
examMicroservice.post('/sync/attempts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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
      results.push({ localId, status: 'error', message: 'Quiz not found on server' });
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

    eventBus.publish({
      id: `evt_sync_${attemptId}`,
      type: 'OFFLINE_ATTEMPTS_SYNCED',
      sourceService: 'exam-service',
      timestamp: new Date().toISOString(),
      payload: {
        userId,
        attemptId,
        score,
        percentage,
      },
    });

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
