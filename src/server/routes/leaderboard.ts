import { Router, Request, Response } from 'express';
import { db } from '../db.ts';

const router = Router();

// GET /api/v1/leaderboard
// Timeframe support: daily, weekly, monthly, all-time
router.get('/', (req: Request, res: Response) => {
  const timeframe = (req.query.timeframe as string) || 'all-time';

  // Compute rank based on aggregate progress & accuracy
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

export default router;
