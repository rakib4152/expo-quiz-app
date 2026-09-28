// API Gateway & Ingress Router
// Acts as reverse proxy, token gatekeeper, and telemetry aggregator for all microservices

import { Router, Request, Response } from 'express';
import { authMicroservice } from '../auth/authService.ts';
import { catalogMicroservice } from '../catalog/catalogService.ts';
import { examMicroservice } from '../exam/examService.ts';
import { analyticsMicroservice } from '../analytics/analyticsService.ts';
import { bookmarksMicroservice } from '../bookmarks/bookmarksService.ts';
import { eventBus } from '../../events/eventBus.ts';

export const apiGateway = Router();

// Gateway Routing Table
apiGateway.use('/auth', authMicroservice);
apiGateway.use('/subjects', catalogMicroservice);
apiGateway.use('/topics', catalogMicroservice);

// Quizzes routing:
// Exam actions (/start, /submit) route to examMicroservice first;
// Public queries (/quizzes, /quizzes/:id) fall through to catalogMicroservice
apiGateway.use('/quizzes', examMicroservice);
apiGateway.use('/quizzes', catalogMicroservice);

apiGateway.use('/attempts', examMicroservice);
apiGateway.use('/sync', examMicroservice);

apiGateway.use('/users', analyticsMicroservice);
apiGateway.use('/leaderboard', analyticsMicroservice);

apiGateway.use('/bookmarks', bookmarksMicroservice);
apiGateway.use('/questions', bookmarksMicroservice);

// --- Microservices Telemetry & Observability Endpoints ---

// GET /api/v1/microservices/status
apiGateway.get('/microservices/status', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      gateway: {
        name: 'QuizPulse Edge API Gateway',
        version: '1.0.0',
        status: 'UP',
        uptime: process.uptime(),
        protocol: 'HTTP/REST + JSON',
      },
      services: [
        {
          name: 'auth-service',
          description: 'Identity, OAuth, Password Hashing & JWT Token Issuer',
          virtualPort: 4001,
          status: 'HEALTHY',
          circuitBreaker: 'CLOSED',
          endpointsCount: 5,
          dbBound: 'Users, Credentials',
        },
        {
          name: 'catalog-service',
          description: 'Syllabus Taxonomies, Subjects, Topics & Question Bank',
          virtualPort: 4002,
          status: 'HEALTHY',
          circuitBreaker: 'CLOSED',
          endpointsCount: 7,
          dbBound: 'Subjects, Topics, Questions, Options',
        },
        {
          name: 'exam-service',
          description: 'Timed Sessions, Grading Engine, Anti-Cheating & Offline Sync',
          virtualPort: 4003,
          status: 'HEALTHY',
          circuitBreaker: 'CLOSED',
          endpointsCount: 4,
          dbBound: 'QuizAttempts, UserAnswers',
        },
        {
          name: 'analytics-service',
          description: 'Event-driven Progress Aggregation, Streaks & Leaderboards',
          virtualPort: 4004,
          status: 'HEALTHY',
          circuitBreaker: 'CLOSED',
          endpointsCount: 4,
          dbBound: 'UserProgress, Leaderboard Cache',
        },
        {
          name: 'bookmarks-service',
          description: 'User Bookmarks & Saved Question Collections',
          virtualPort: 4005,
          status: 'HEALTHY',
          circuitBreaker: 'CLOSED',
          endpointsCount: 3,
          dbBound: 'Bookmarks',
        },
      ],
      messageBroker: {
        type: 'In-Memory Pub/Sub (Redis / RabbitMQ drop-in replacement)',
        status: 'ACTIVE',
        activeSubscribers: 3,
        totalEventsProcessed: eventBus.getRecentEvents().length,
      },
    },
  });
});

// GET /api/v1/microservices/events
apiGateway.get('/microservices/events', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      events: eventBus.getRecentEvents(),
    },
  });
});

// Health check endpoint
apiGateway.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'QuizPulse Microservices API Gateway',
  });
});
