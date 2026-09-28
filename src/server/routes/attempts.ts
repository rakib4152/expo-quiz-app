import { Router, Response } from 'express';
import { db } from '../db.ts';
import { requireAuth, AuthenticatedRequest } from '../auth.ts';

const router = Router();

// GET /api/v1/attempts/:id
// Returns full evaluated results and question review with explanations
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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

  // Security: Only expose solutions and explanations if the attempt is submitted
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

export default router;
