import { Router } from 'express';
import authRouter from './routes/auth.ts';
import subjectsRouter from './routes/subjects.ts';
import topicsRouter from './routes/topics.ts';
import quizzesRouter from './routes/quizzes.ts';
import attemptsRouter from './routes/attempts.ts';
import bookmarksRouter from './routes/bookmarks.ts';
import usersRouter from './routes/users.ts';
import leaderboardRouter from './routes/leaderboard.ts';
import syncRouter from './routes/sync.ts';

const apiV1Router = Router();

// Mount all v1 sub-routers
apiV1Router.use('/auth', authRouter);
apiV1Router.use('/subjects', subjectsRouter);
apiV1Router.use('/topics', topicsRouter);
apiV1Router.use('/quizzes', quizzesRouter);
apiV1Router.use('/attempts', attemptsRouter);
apiV1Router.use('/bookmarks', bookmarksRouter);
apiV1Router.use('/users', usersRouter);
apiV1Router.use('/leaderboard', leaderboardRouter);
apiV1Router.use('/sync', syncRouter);

// Health check endpoint
apiV1Router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'QuizPulse REST API',
  });
});

export default apiV1Router;
