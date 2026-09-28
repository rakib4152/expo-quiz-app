import React, { useState, useEffect } from 'react';
import {
  Server,
  Smartphone,
  Database,
  Shield,
  Layers,
  Code2,
  Terminal,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronRight,
  Send,
  Boxes,
  Cpu,
  Activity,
  Radio,
  RefreshCw,
  GitBranch,
} from 'lucide-react';
import { api } from '../mobile/services/api/client.ts';

export const ArchitectureDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'microservices' | 'schema' | 'endpoints' | 'codebase'>('microservices');
  const [microservicesStatus, setMicroservicesStatus] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const fetchMicroservicesTelemetry = async () => {
    setIsLoadingStatus(true);
    try {
      const [statusRes, eventsRes] = await Promise.all([
        api.get('/microservices/status', { requiresAuth: false }),
        api.get('/microservices/events', { requiresAuth: false }),
      ]);
      if (statusRes.data) setMicroservicesStatus(statusRes.data);
      if (eventsRes.data?.events) setLiveEvents(eventsRes.data.events);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchMicroservicesTelemetry();
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-200">
      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 space-x-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'microservices', label: '1. Microservices Decomposition & Event Bus', icon: Boxes },
          { id: 'architecture', label: '2. High-Level Architecture', icon: Layers },
          { id: 'schema', label: '3. Prisma Relational Schema', icon: Database },
          { id: 'endpoints', label: '4. REST API Specification', icon: Server },
          { id: 'codebase', label: '5. Docker Compose & Project Layout', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Microservices Decomposition */}
      {activeTab === 'microservices' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Microservices Topology ASCII Diagram */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-emerald-600" />
                  <span>Microservices Topology & Decoupled Architecture</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Single Responsibilities • Independent Scalability • Event-Driven Asynchrony
                </p>
              </div>

              <button
                onClick={fetchMicroservicesTelemetry}
                disabled={isLoadingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>
            </div>

            <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{`                       ┌───────────────────────────────┐
                       │   REACT NATIVE EXPO CLIENT    │
                       └───────────────┬───────────────┘
                                       │ HTTPS / REST (Port 3000)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EDGE API GATEWAY (Reverse Proxy & Ingress)               │
│                                                                             │
│  - JWT Verification & Rate Limiting                                         │
│  - Ingress Reverse Proxy to downstream microservices                        │
│  - Circuit Breakers & Request Correlation IDs                               │
└──────┬───────────────┬───────────────┬───────────────┬───────────────┬──────┘
       │ :4001         │ :4002         │ :4003         │ :4004         │ :4005
       ▼               ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   AUTH &    │ │  CONTENT &  │ │   EXAM &    │ │ ANALYTICS & │ │ BOOKMARKS & │
│  IDENTITY   │ │   CATALOG   │ │   SCORING   │ │ LEADERBOARD │ │ COLLECTIONS │
│   SERVICE   │ │   SERVICE   │ │   ENGINE    │ │   SERVICE   │ │   SERVICE   │
│             │ │             │ │             │ │             │ │             │
│ - Register  │ │ - Subjects  │ │ - Active Qz │ │ - Progress  │ │ - Bookmark  │
│ - Login     │ │ - Topics    │ │ - Grading   │ │ - Streaks   │ │ - List Qs   │
│ - Refresh   │ │ - Questions │ │ - AntiCheat │ │ - Accuracy  │ │ - Delete    │
│ - Me        │ │ - Options   │ │ - Sync Q    │ │ - Top Ranks │ │             │
└──────┬──────┘ └─────────────┘ └──────┬──────┘ └──────▲──────┘ └──────┬──────┘
       │                               │               │               │
       │ AUTH_USER_REGISTERED          │ EXAM_SUBMITTED│               │ BOOKMARK_EVT
       └──────────────────────────┐    │               │    ┌──────────┘
                                  ▼    ▼               │    ▼
                   ┌───────────────────────────────────────┐
                   │     EVENT BUS / MESSAGE BROKER        │
                   │    (Redis Pub/Sub / RabbitMQ Topic)   │
                   │                                       │
                   │ Asynchronous pub/sub decouples scoring│
                   │ from leaderboard calculation.         │
                   └───────────────────────────────────────┘`}</pre>
            </div>
          </div>

          {/* Live Microservices Health & Service Registry */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span>Live Microservice Registry & Health</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: 'auth-service',
                  port: 4001,
                  desc: 'Identity, OAuth, Password Hashing & JWT Token Issuer',
                  db: 'Users, Credentials',
                  events: 'Emits: AUTH_USER_REGISTERED',
                },
                {
                  name: 'catalog-service',
                  port: 4002,
                  desc: 'Syllabus Taxonomies, Subjects, Topics & Question Bank',
                  db: 'Subjects, Topics, Questions, Options',
                  events: 'Read-optimized cache',
                },
                {
                  name: 'exam-service',
                  port: 4003,
                  desc: 'Timed Sessions, Grading Engine, Anti-Cheating & Sync',
                  db: 'QuizAttempts, UserAnswers',
                  events: 'Emits: EXAM_ATTEMPT_SUBMITTED',
                },
                {
                  name: 'analytics-service',
                  port: 4004,
                  desc: 'Event-driven Progress Aggregation, Streaks & Rankings',
                  db: 'UserProgress, Leaderboard Cache',
                  events: 'Subscribes: EXAM_ATTEMPT_SUBMITTED',
                },
                {
                  name: 'bookmarks-service',
                  port: 4005,
                  desc: 'User Bookmarks & Saved Question Collections',
                  db: 'Bookmarks',
                  events: 'Emits: BOOKMARK_CREATED/DELETED',
                },
                {
                  name: 'event-broker',
                  port: 6379,
                  desc: 'In-Memory Pub/Sub Message Broker (Redis/RabbitMQ)',
                  db: 'Transient Event Queue',
                  events: 'Decoupled inter-service bus',
                },
              ].map((svc) => (
                <div
                  key={svc.name}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {svc.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      :{svc.port}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                    {svc.desc}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong>Data Partition:</strong> {svc.db}
                    </div>
                    <div className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                      {svc.events}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Event Bus Activity Stream */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Message Broker Real-Time Event Stream
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {liveEvents.length} Recent Events Logged
              </span>
            </div>

            <p className="text-xs text-slate-500">
              When an action occurs (e.g. submitting a quiz in the mobile simulator or bookmarking a question), microservices emit decoupled events through the Message Broker.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liveEvents.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Waiting for events... Practice a quiz in the Mobile Simulator to see events broadcast here live!
                </div>
              ) : (
                liveEvents.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    className="bg-slate-950 text-slate-300 font-mono text-xs p-3 rounded-xl border border-slate-800 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">[{evt.type}]</span>
                        <span className="text-slate-500 text-[11px]">from {evt.sourceService}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 line-clamp-1">
                        Payload: {JSON.stringify(evt.payload)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Complete Architecture & Auth */}
      {activeTab === 'architecture' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Complete System Architecture</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Security & Anti-Cheating Invariants</span>
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Untrusted Mobile Client:</strong> The client never receives <code>isCorrect</code> or answers during the quiz.</li>
                  <li><strong>Server-Enforced Timing:</strong> <code>startedAt</code> and <code>expiresAt</code> are checked server-side upon submit.</li>
                  <li><strong>Server-Side Evaluation:</strong> Score, percentage, and metrics are computed solely in backend code.</li>
                  <li><strong>Idempotency:</strong> Duplicate quiz submissions are prevented with status locking.</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Offline First & Sync Engine</span>
                </h3>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                  <li><strong>Local SQLite Cache:</strong> Downloaded quizzes and questions stored in SQLite tables.</li>
                  <li><strong>Offline Attempts Queue:</strong> User answers cached locally without dropping state.</li>
                  <li><strong>Batch Sync Endpoint:</strong> <code>POST /api/v1/sync/attempts</code> syncs when connection returns.</li>
                  <li><strong>Instant Local Selection:</strong> Selected options are written locally immediately.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Prisma Schema */}
      {activeTab === 'schema' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Prisma PostgreSQL Schema (prisma/schema.prisma)</span>
              </h2>
              <button
                onClick={() => copyToClipboard('// See full prisma file in repository /prisma/schema.prisma', 'schema')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'schema' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSection === 'schema' ? 'Copied' : 'Copy Schema'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Normalized relational schema with indexes, cascades, UUID primary keys, and relations between Subject, Topic, Question, Option, Quiz, QuizAttempt, and Bookmarks.
            </p>

            <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-2xl overflow-x-auto max-h-[480px]">
              <pre>{`model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  passwordHash String
  avatarUrl    String?
  role         Role          @default(USER)
  refreshToken String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  attempts     QuizAttempt[]
  bookmarks    Bookmark[]
  progress     UserProgress?
}

model Subject {
  id          String     @id @default(uuid())
  name        String     @unique
  code        String     @unique
  description String?
  icon        String?
  color       String     @default("#4F46E5")
  topics      Topic[]
  questions   Question[]
  quizzes     Quiz[]
}

model Topic {
  id          String     @id @default(uuid())
  subjectId   String
  name        String
  description String?
  order       Int        @default(0)
  subject     Subject    @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  questions   Question[]
  quizzes     Quiz[]
}

model Question {
  id           String         @id @default(uuid())
  subjectId    String
  topicId      String?
  questionText String
  explanation  String
  difficulty   Difficulty     @default(MEDIUM)
  questionType QuestionType   @default(MULTIPLE_CHOICE)
  subject      Subject        @relation(fields: [subjectId], references: [id], onDelete: Restrict)
  topic        Topic?         @relation(fields: [topicId], references: [id], onDelete: SetNull)
  options      Option[]
  quizItems    QuizQuestion[]
  userAnswers  UserAnswer[]
  bookmarks    Bookmark[]
}

model Option {
  id           String       @id @default(uuid())
  questionId   String
  optionText   String
  isCorrect    Boolean      @default(false)
  question     Question     @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userAnswers  UserAnswer[]
}

model Quiz {
  id             String         @id @default(uuid())
  title          String
  description    String
  subjectId      String?
  topicId        String?
  duration       Int            // Duration in minutes
  totalQuestions Int            @default(0)
  difficulty     Difficulty     @default(MEDIUM)
  isPublished    Boolean        @default(true)
  quizQuestions  QuizQuestion[]
  attempts       QuizAttempt[]
}

model QuizAttempt {
  id                String        @id @default(uuid())
  userId            String
  quizId            String
  startedAt         DateTime      @default(now())
  expiresAt         DateTime
  completedAt       DateTime?
  status            AttemptStatus @default(IN_PROGRESS)
  totalQuestions    Int
  answeredQuestions Int           @default(0)
  correctAnswers    Int           @default(0)
  incorrectAnswers  Int           @default(0)
  score             Float         @default(0)
  percentage        Float         @default(0)
  timeTaken         Int           @default(0) // seconds
  answers           UserAnswer[]
}`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: REST API Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>All Implemented REST API Endpoints (/api/v1)</span>
            </h2>

            <div className="space-y-2.5">
              {[
                { method: 'POST', path: '/api/v1/auth/login', svc: 'auth-service (:4001)', desc: 'Authenticates user, returns access & refresh tokens' },
                { method: 'POST', path: '/api/v1/auth/register', svc: 'auth-service (:4001)', desc: 'Registers new student with hashed password' },
                { method: 'GET', path: '/api/v1/auth/me', svc: 'auth-service (:4001)', desc: 'Returns current authenticated user profile' },
                { method: 'GET', path: '/api/v1/subjects', svc: 'catalog-service (:4002)', desc: 'Lists all subjects with topic and question counts' },
                { method: 'GET', path: '/api/v1/subjects/:id/topics', svc: 'catalog-service (:4002)', desc: 'Returns syllabus topics for given subject' },
                { method: 'GET', path: '/api/v1/quizzes', svc: 'catalog-service (:4002)', desc: 'Lists published quizzes with search, subject & difficulty filters' },
                { method: 'POST', path: '/api/v1/quizzes/:id/start', svc: 'exam-service (:4003)', desc: 'Creates QuizAttempt, returns questions without isCorrect' },
                { method: 'POST', path: '/api/v1/quizzes/:id/submit', svc: 'exam-service (:4003)', desc: 'Evaluates answers server-side, emits event to broker' },
                { method: 'GET', path: '/api/v1/attempts/:id', svc: 'exam-service (:4003)', desc: 'Returns evaluated score and questions review with explanations' },
                { method: 'POST', path: '/api/v1/questions/:id/bookmark', svc: 'bookmarks-service (:4005)', desc: 'Bookmarks question for offline revision' },
                { method: 'GET', path: '/api/v1/users/me/statistics', svc: 'analytics-service (:4004)', desc: 'Returns subject accuracy, topic breakdown, streak' },
                { method: 'GET', path: '/api/v1/leaderboard', svc: 'analytics-service (:4004)', desc: 'Ranks users by score and accuracy across daily/weekly/all-time' },
                { method: 'POST', path: '/api/v1/sync/attempts', svc: 'exam-service (:4003)', desc: 'Synchronizes queued attempts solved while offline' },
              ].map((ep, i) => (
                <div
                  key={i}
                  className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 font-mono">
                    <span
                      className={`font-extrabold px-2 py-0.5 rounded-md text-[10px] ${
                        ep.method === 'POST'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ep.path}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono hidden md:inline">
                      {ep.svc}
                    </span>
                  </div>
                  <span className="text-slate-500 hidden sm:inline">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Docker Compose & Microservices Layout */}
      {activeTab === 'codebase' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              <span>Production docker-compose.yml</span>
            </h3>
            <p className="text-xs text-slate-500">
              Orchestrates the Edge Gateway, 5 Microservices, Redis Message Broker, and PostgreSQL cluster in an isolated bridge network.
            </p>

            <pre className="bg-slate-950 text-slate-300 font-mono text-xs p-4 rounded-xl overflow-x-auto leading-relaxed max-h-[380px]">
{`version: '3.8'

services:
  # 1. Edge API Gateway / Ingress Router
  api-gateway:
    build: .
    ports: ["3000:3000"]
    environment:
      - AUTH_SERVICE_URL=http://auth-service:4001
      - CATALOG_SERVICE_URL=http://catalog-service:4002
      - EXAM_SERVICE_URL=http://exam-service:4003
      - ANALYTICS_SERVICE_URL=http://analytics-service:4004
      - BOOKMARKS_SERVICE_URL=http://bookmarks-service:4005
      - REDIS_URL=redis://message-broker:6379

  # 2. Identity & Authentication Microservice (:4001)
  auth-service:
    ports: ["4001:4001"]
    environment:
      - DATABASE_URL=postgresql://quiz_user:quiz_secret@postgres-db:5432/quizpulse_auth

  # 3. Content & Catalog Microservice (:4002)
  catalog-service:
    ports: ["4002:4002"]

  # 4. Exam & Scoring Engine Microservice (:4003)
  exam-service:
    ports: ["4003:4003"]

  # 5. Analytics & Leaderboard Microservice (:4004)
  analytics-service:
    ports: ["4004:4004"]

  # 6. Bookmarks Microservice (:4005)
  bookmarks-service:
    ports: ["4005:4005"]

  # 7. Redis Message Broker (:6379)
  message-broker:
    image: redis:7-alpine

  # 8. PostgreSQL Database (:5432)
  postgres-db:
    image: postgres:16-alpine`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
