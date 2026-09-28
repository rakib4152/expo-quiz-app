import { Router, Response } from 'express';
import { db, DbQuizAttempt, DbUserAnswer } from '../db.ts';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/v1/quizzes
router.get('/', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const subjectId = req.query.subjectId as string;
  const topicId = req.query.topicId as string;
  const difficulty = req.query.difficulty as string;
  const search = (req.query.search as string || '').toLowerCase().trim();
  const sort = req.query.sort as string; // 'newest' | 'popular' | 'duration'

  let filtered = db.quizzes.filter((q) => q.isPublished);

  if (subjectId) {
    filtered = filtered.filter((q) => q.subjectId === subjectId);
  }
  if (topicId) {
    filtered = filtered.filter((q) => q.topicId === topicId);
  }
  if (difficulty) {
    filtered = filtered.filter((q) => q.difficulty === difficulty);
  }
  if (search) {
    filtered = filtered.filter(
      (q) => q.title.toLowerCase().includes(search) || q.description.toLowerCase().includes(search)
    );
  }

  // Sorting
  if (sort === 'popular') {
    filtered.sort((a, b) => {
      const attemptsA = db.attempts.filter((att) => att.quizId === a.id).length;
      const attemptsB = db.attempts.filter((att) => att.quizId === b.id).length;
      return attemptsB - attemptsA;
    });
  } else if (sort === 'duration') {
    filtered.sort((a, b) => a.duration - b.duration);
  } else {
    // Newest default
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const paginated = filtered.slice(offset, offset + limit).map((quiz) => {
    const subject = quiz.subjectId ? db.getSubjectById(quiz.subjectId) : null;
    const topic = quiz.topicId ? db.topics.find((t) => t.id === quiz.topicId) : null;

    let userBestScore: number | null = null;
    if (req.userId) {
      const userAttempts = db.attempts.filter(
        (a) => a.userId === req.userId && a.quizId === quiz.id && a.status === 'SUBMITTED'
      );
      if (userAttempts.length > 0) {
        userBestScore = Math.max(...userAttempts.map((a) => a.percentage));
      }
    }

    return {
      ...quiz,
      subject,
      topic,
      userBestScore,
    };
  });

  res.json({
    success: true,
    data: paginated,
    meta: {
      total: filtered.length,
      page,
      limit,
      hasNextPage: offset + limit < filtered.length,
    },
  });
});

// GET /api/v1/quizzes/:id
router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) {
    res.status(404).json({
      success: false,
      error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' },
    });
    return;
  }

  const subject = quiz.subjectId ? db.getSubjectById(quiz.subjectId) : null;
  const topic = quiz.topicId ? db.topics.find((t) => t.id === quiz.topicId) : null;

  let userBestScore: number | null = null;
  let activeAttemptId: string | null = null;

  if (req.userId) {
    const attempts = db.attempts.filter((a) => a.userId === req.userId && a.quizId === quiz.id);
    const submitted = attempts.filter((a) => a.status === 'SUBMITTED');
    if (submitted.length > 0) {
      userBestScore = Math.max(...submitted.map((a) => a.percentage));
    }
    const inProgress = attempts.find(
      (a) => a.status === 'IN_PROGRESS' && new Date(a.expiresAt).getTime() > Date.now()
    );
    if (inProgress) {
      activeAttemptId = inProgress.id;
    }
  }

  res.json({
    success: true,
    data: {
      ...quiz,
      subject,
      topic,
      userBestScore,
      activeAttemptId,
    },
  });
});

// GET /api/v1/quizzes/:id/questions
// Note: Security rule - never return isCorrect or explanations here!
router.get('/:id/questions', (req: AuthenticatedRequest, res: Response) => {
  const quiz = db.quizzes.find((q) => q.id === req.params.id);
  if (!quiz) {
    res.status(404).json({
      success: false,
      error: { code: 'QUIZ_NOT_FOUND', message: 'Quiz not found' },
    });
    return;
  }

  const questions = db.getQuestionsByQuizId(quiz.id);
  const secureQuestions = questions.map((q) => ({
    id: q.id,
    questionText: q.questionText,
    difficulty: q.difficulty,
    questionType: q.questionType,
    options: db.getOptionsByQuestionId(q.id).map((o) => ({
      id: o.id,
      questionId: o.questionId,
      optionText: o.optionText,
    })),
  }));

  res.json({
    success: true,
    data: secureQuestions,
  });
});

// POST /api/v1/quizzes/:id/start
router.post('/:id/start', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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

  // Check if there is already an active non-expired attempt for this user
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

  // Strip correct answers
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

// POST /api/v1/quizzes/:id/submit
router.post('/:id/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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

  // Prevent duplicate submissions
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

  // Clear previous answers for this attempt if any
  db.userAnswers = db.userAnswers.filter((ua) => ua.attemptId !== attempt.id);

  // Evaluate each question strictly on backend
  for (const q of questions) {
    const userAnswer = userAnswersList.find((ans) => ans.questionId === q.id);
    if (userAnswer && userAnswer.optionId) {
      answeredCount++;
      const option = db.options.find((o) => o.id === userAnswer.optionId && o.questionId === q.id);
      const isCorrect = option ? option.isCorrect : false;

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

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
  const score = correctCount * 10; // 10 points per question

  // Update Attempt record
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

  // Update User Progress aggregate
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
      lastActiveAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    db.progress.push(progress);
  }

  const userSubmittedAttempts = db.attempts.filter((a) => a.userId === userId && a.status === 'SUBMITTED');
  progress.totalQuizzesCompleted = userSubmittedAttempts.length;
  progress.totalQuestionsAnswered = userSubmittedAttempts.reduce((sum, a) => sum + a.answeredQuestions, 0);
  progress.correctAnswers = userSubmittedAttempts.reduce((sum, a) => sum + a.correctAnswers, 0);
  const avg = userSubmittedAttempts.reduce((sum, a) => sum + a.percentage, 0) / userSubmittedAttempts.length;
  progress.averageScore = Math.round(avg * 10) / 10;
  progress.lastActiveAt = now.toISOString();
  progress.updatedAt = now.toISOString();

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

export default router;
