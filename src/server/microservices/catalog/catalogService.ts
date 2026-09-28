// Content & Quiz Catalog Microservice
// Port 4002 equivalent - Manages Subject taxonomies, topics, questions, options, and quiz definitions

import { Router, Request, Response } from 'express';
import { db } from '../../db.ts';
import { optionalAuth, AuthenticatedRequest } from '../../auth.ts';

export const catalogMicroservice = Router();

// --- SUBJECTS ---

// GET /subjects
catalogMicroservice.get('/subjects', (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const subjects = db.subjects.map((sub) => {
    const topicsCount = db.topics.filter((t) => t.subjectId === sub.id).length;
    const questionsCount = db.questions.filter((q) => q.subjectId === sub.id).length;
    const quizzesCount = db.quizzes.filter((qz) => qz.subjectId === sub.id).length;
    return {
      ...sub,
      topicsCount,
      questionsCount,
      quizzesCount,
    };
  });

  const paginated = subjects.slice(offset, offset + limit);

  res.json({
    success: true,
    data: paginated,
    meta: {
      total: subjects.length,
      page,
      limit,
      hasNextPage: offset + limit < subjects.length,
    },
  });
});

// GET /subjects/:id
catalogMicroservice.get('/subjects/:id', (req: Request, res: Response) => {
  const subject = db.getSubjectById(req.params.id);
  if (!subject) {
    res.status(404).json({
      success: false,
      error: { code: 'SUBJECT_NOT_FOUND', message: 'Subject not found' },
    });
    return;
  }

  const topicsCount = db.topics.filter((t) => t.subjectId === subject.id).length;
  const questionsCount = db.questions.filter((q) => q.subjectId === subject.id).length;
  const quizzesCount = db.quizzes.filter((qz) => qz.subjectId === subject.id).length;

  res.json({
    success: true,
    data: {
      ...subject,
      topicsCount,
      questionsCount,
      quizzesCount,
    },
  });
});

// GET /subjects/:id/topics
catalogMicroservice.get('/subjects/:id/topics', (req: Request, res: Response) => {
  const subject = db.getSubjectById(req.params.id);
  if (!subject) {
    res.status(404).json({
      success: false,
      error: { code: 'SUBJECT_NOT_FOUND', message: 'Subject not found' },
    });
    return;
  }

  const topics = db.topics
    .filter((t) => t.subjectId === subject.id)
    .sort((a, b) => a.order - b.order)
    .map((topic) => {
      const questionsCount = db.questions.filter((q) => q.topicId === topic.id).length;
      const quizzesCount = db.quizzes.filter((qz) => qz.topicId === topic.id).length;
      return {
        ...topic,
        questionsCount,
        quizzesCount,
      };
    });

  res.json({
    success: true,
    data: topics,
  });
});

// --- TOPICS ---

// GET /topics/:id
catalogMicroservice.get('/topics/:id', (req: Request, res: Response) => {
  const topic = db.topics.find((t) => t.id === req.params.id);
  if (!topic) {
    res.status(404).json({
      success: false,
      error: { code: 'TOPIC_NOT_FOUND', message: 'Topic not found' },
    });
    return;
  }

  const subject = db.getSubjectById(topic.subjectId);
  const questionsCount = db.questions.filter((q) => q.topicId === topic.id).length;
  const quizzesCount = db.quizzes.filter((qz) => qz.topicId === topic.id).length;

  res.json({
    success: true,
    data: {
      ...topic,
      subjectName: subject?.name,
      questionsCount,
      quizzesCount,
    },
  });
});

// --- QUIZZES ---

// GET /quizzes
catalogMicroservice.get('/quizzes', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const subjectId = req.query.subjectId as string;
  const topicId = req.query.topicId as string;
  const difficulty = req.query.difficulty as string;
  const search = (req.query.search as string || '').toLowerCase().trim();
  const sort = req.query.sort as string;

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

  if (sort === 'popular') {
    filtered.sort((a, b) => {
      const attemptsA = db.attempts.filter((att) => att.quizId === a.id).length;
      const attemptsB = db.attempts.filter((att) => att.quizId === b.id).length;
      return attemptsB - attemptsA;
    });
  } else if (sort === 'duration') {
    filtered.sort((a, b) => a.duration - b.duration);
  } else {
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

// GET /quizzes/:id
catalogMicroservice.get('/quizzes/:id', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
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

// GET /quizzes/:id/questions
// Security Rule: Strip isCorrect and explanations for student security
catalogMicroservice.get('/quizzes/:id/questions', (_req: Request, res: Response) => {
  const quiz = db.quizzes.find((q) => q.id === _req.params.id);
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
