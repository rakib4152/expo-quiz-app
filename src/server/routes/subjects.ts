import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/v1/subjects
router.get('/', (req: Request, res: Response) => {
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

// GET /api/v1/subjects/:id
router.get('/:id', (req: Request, res: Response) => {
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

// GET /api/v1/subjects/:id/topics
router.get('/:id/topics', (req: Request, res: Response) => {
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

// GET /api/v1/subjects/:id/questions
router.get('/:id/questions', (req: Request, res: Response) => {
  const subject = db.getSubjectById(req.params.id);
  if (!subject) {
    res.status(404).json({
      success: false,
      error: { code: 'SUBJECT_NOT_FOUND', message: 'Subject not found' },
    });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string;

  let questions = db.questions.filter((q) => q.subjectId === subject.id);
  if (cursor) {
    const idx = questions.findIndex((q) => q.id === cursor);
    if (idx !== -1) {
      questions = questions.slice(idx + 1);
    }
  }

  const items = questions.slice(0, limit).map((q) => ({
    ...q,
    options: db.getOptionsByQuestionId(q.id).map((opt) => ({
      id: opt.id,
      questionId: opt.questionId,
      optionText: opt.optionText,
    })),
  }));

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;

  res.json({
    success: true,
    data: items,
    meta: {
      nextCursor,
      hasNextPage: !!nextCursor,
    },
  });
});

export default router;
