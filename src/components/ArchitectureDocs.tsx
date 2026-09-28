import React, { useState } from 'react';
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
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'endpoints' | 'codebase'>('architecture');

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-200">
      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 space-x-2">
        {[
          { id: 'architecture', label: '1. Architecture & Security', icon: Layers },
          { id: 'schema', label: '2. Prisma PostgreSQL Schema', icon: Database },
          { id: 'endpoints', label: '3. REST API Specification', icon: Server },
          { id: 'codebase', label: '4. Expo & Backend Structures', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* SECTION 1: Complete Architecture & Auth */}
      {activeTab === 'architecture' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Complete System Architecture</span>
            </h2>

            {/* ASCII Diagram */}
            <div className="bg-slate-950 text-emerald-400 font-mono text-xs p-5 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800">
              <pre>{`┌─────────────────────────────────────────────────────────────┐
│                 REACT NATIVE + EXPO CLIENT                  │
│                                                             │
│   Expo Router (Tabs) ──── TanStack Query (Server State)      │
│          │                              │                   │
│          ▼                              ▼                   │
│    Zustand Store                  API Client                │
│    (UI & Active Quiz)    (Auto Bearer Header + Refresh)     │
│          │                              │                   │
│          ▼                              ▼                   │
│   SQLite / SecureStore            REST Client               │
│  (Offline Queue / Tokens)         (HTTPS JSON)              │
└───────────────────────────────┬─────────────────────────────┘
                                │  REST API (/api/v1)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS / EXPRESS BACKEND                 │
│                                                             │
│   Middleware Stack:                                         │
│   - CORS & Request Validation (Zod)                         │
│   - Authentication Middleware (JWT / Bearer Token)          │
│   - Rate Limiting & Protection                              │
│                                                             │
│   Controllers & Business Modules:                           │
│   - Auth Controller (Bcrypt / PBKDF2 Password Hashing)       │
│   - Quiz Attempt Controller (Anti-Cheating, Timed Windows)  │
│   - Scoring Engine (Strict Server-Side Correctness & Stats) │
│   - Offline Sync Controller (Idempotent Batch Evaluator)    │
└───────────────────────────────┬─────────────────────────────┘
                                │  Prisma Client ORM
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                POSTGRESQL RELATIONAL DATABASE               │
│                                                             │
│   - User, Subject, Topic, Question, Option, Quiz            │
│   - QuizQuestion (M:N), QuizAttempt, UserAnswer, Bookmark   │
│   - UserProgress (Aggregates, Streaks, Accuracy)            │
└─────────────────────────────────────────────────────────────┘`}</pre>
            </div>

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

      {/* SECTION 2: Prisma Schema */}
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
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
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

      {/* SECTION 3: REST API Endpoints */}
      {activeTab === 'endpoints' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-600" />
              <span>All Implemented REST API Endpoints (/api/v1)</span>
            </h2>

            <div className="space-y-2.5">
              {[
                { method: 'POST', path: '/api/v1/auth/login', desc: 'Authenticates user, returns access & refresh tokens' },
                { method: 'POST', path: '/api/v1/auth/register', desc: 'Registers new student with hashed password' },
                { method: 'GET', path: '/api/v1/auth/me', desc: 'Returns current authenticated user profile' },
                { method: 'GET', path: '/api/v1/subjects', desc: 'Lists all subjects with topic and question counts' },
                { method: 'GET', path: '/api/v1/subjects/:id/topics', desc: 'Returns syllabus topics for given subject' },
                { method: 'GET', path: '/api/v1/quizzes', desc: 'Lists published quizzes with search, subject & difficulty filters' },
                { method: 'POST', path: '/api/v1/quizzes/:id/start', desc: 'Creates QuizAttempt, returns questions without isCorrect' },
                { method: 'POST', path: '/api/v1/quizzes/:id/submit', desc: 'Evaluates answers server-side, records score & stats' },
                { method: 'GET', path: '/api/v1/attempts/:id', desc: 'Returns evaluated score and questions review with explanations' },
                { method: 'POST', path: '/api/v1/questions/:id/bookmark', desc: 'Bookmarks question for offline revision' },
                { method: 'GET', path: '/api/v1/users/me/statistics', desc: 'Returns subject accuracy, topic breakdown, streak' },
                { method: 'GET', path: '/api/v1/leaderboard', desc: 'Ranks users by score and accuracy across daily/weekly/all-time' },
                { method: 'POST', path: '/api/v1/sync/attempts', desc: 'Synchronizes queued attempts solved while offline' },
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
                  </div>
                  <span className="text-slate-500 hidden sm:inline">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Expo & Backend Codebase Layout */}
      {activeTab === 'codebase' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backend Tree */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-600" />
                <span>Backend Directory Structure</span>
              </h3>
              <pre className="bg-slate-950 text-slate-300 font-mono text-xs p-3.5 rounded-xl overflow-x-auto leading-relaxed">
{`backend/
├── app/
│   └── api/
│       └── v1/
│           ├── auth/
│           ├── subjects/
│           ├── quizzes/
│           ├── attempts/
│           ├── bookmarks/
│           ├── users/
│           └── leaderboard/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── validation.ts
├── prisma/
│   └── schema.prisma
└── server.ts`}
              </pre>
            </div>

            {/* Mobile Expo Tree */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Expo React Native Directory Structure</span>
              </h3>
              <pre className="bg-slate-950 text-slate-300 font-mono text-xs p-3.5 rounded-xl overflow-x-auto leading-relaxed">
{`mobile/
├── app/
│   ├── _layout.tsx
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── subjects.tsx
│   │   ├── quizzes.tsx
│   │   ├── bookmarks.tsx
│   │   └── profile.tsx
│   ├── quiz/
│   │   ├── [id].tsx
│   │   └── attempt/[attemptId].tsx
│   └── result/[attemptId].tsx
├── db/
│   └── sqlite.ts
├── store/
│   ├── authStore.ts
│   └── quizStore.ts
└── services/
    └── api/client.ts`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
