// User Collections & Bookmarks Microservice
// Port 4005 equivalent - Manages user bookmarks, saved questions collection, and offline sync

import { Router, Response } from 'express';
import { db, DbBookmark } from '../../db.ts';
import { requireAuth, AuthenticatedRequest } from '../../auth.ts';
import { eventBus } from '../../events/eventBus.ts';

export const bookmarksMicroservice = Router();

// GET /bookmarks
bookmarksMicroservice.get('/bookmarks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const userBookmarks = db.getUserBookmarks(userId);

  const enriched = userBookmarks
    .map((bmk) => {
      const question = db.questions.find((q) => q.id === bmk.questionId);
      if (!question) return null;

      const subject = db.getSubjectById(question.subjectId);
      const topic = question.topicId ? db.topics.find((t) => t.id === question.topicId) : null;
      const options = db.getOptionsByQuestionId(question.id);

      return {
        id: bmk.id,
        userId: bmk.userId,
        questionId: bmk.questionId,
        createdAt: bmk.createdAt,
        question: {
          ...question,
          subjectName: subject?.name,
          topicName: topic?.name,
          options,
        },
      };
    })
    .filter(Boolean);

  res.json({
    success: true,
    data: enriched,
  });
});

// POST /questions/:id/bookmark
bookmarksMicroservice.post('/questions/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const questionId = req.params.id;

  const question = db.questions.find((q) => q.id === questionId);
  if (!question) {
    res.status(404).json({
      success: false,
      error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found' },
    });
    return;
  }

  const existing = db.bookmarks.find((b) => b.userId === userId && b.questionId === questionId);
  if (existing) {
    res.json({
      success: true,
      data: { message: 'Question already bookmarked', bookmarkId: existing.id },
    });
    return;
  }

  const newBookmark: DbBookmark = {
    id: `bmk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    questionId,
    createdAt: new Date().toISOString(),
  };
  db.bookmarks.push(newBookmark);

  eventBus.publish({
    id: `evt_bmk_${newBookmark.id}`,
    type: 'BOOKMARK_CREATED',
    sourceService: 'bookmarks-service',
    timestamp: newBookmark.createdAt,
    payload: { userId, questionId },
  });

  res.status(201).json({
    success: true,
    data: {
      message: 'Question bookmarked successfully',
      bookmarkId: newBookmark.id,
    },
  });
});

// DELETE /questions/:id/bookmark
bookmarksMicroservice.delete('/questions/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.userId!;
  const questionId = req.params.id;

  const index = db.bookmarks.findIndex((b) => b.userId === userId && b.questionId === questionId);
  if (index === -1) {
    res.status(404).json({
      success: false,
      error: { code: 'BOOKMARK_NOT_FOUND', message: 'Bookmark does not exist' },
    });
    return;
  }

  db.bookmarks.splice(index, 1);

  eventBus.publish({
    id: `evt_unbmk_${Date.now()}`,
    type: 'BOOKMARK_DELETED',
    sourceService: 'bookmarks-service',
    timestamp: new Date().toISOString(),
    payload: { userId, questionId },
  });

  res.json({
    success: true,
    data: { message: 'Bookmark removed successfully' },
  });
});
