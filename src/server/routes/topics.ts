import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/v1/topics/:id
router.get('/:id', (req: Request, res: Response) => {
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

// GET /api/v1/topics/:id/questions
router.get('/:id/questions', (req: Request, res: Response) => {
  const topic = db.topics.find((t) => t.id === req.params.id);
  if (!topic) {
    res.status(404).json({
      success: false,
      error: { code: 'TOPIC_NOT_FOUND', message: 'Topic not found' },
    });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 20;
  const cursor = req.query.cursor as string;
  const difficulty = req.query.difficulty as string;

  let questions = db.questions.filter((q) => q.topicId === topic.id);
  if (difficulty) {
    questions = questions.filter((q) => q.difficulty === difficulty);
  }

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
