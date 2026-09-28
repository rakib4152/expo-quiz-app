import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
  ChevronRight,
  Boxes,
  Activity,
  Radio,
  RefreshCw,
} from 'lucide-react-native';
import { api } from '../mobile/services/api/client.ts';

export const ArchitectureDocs: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'microservices' | 'schema' | 'endpoints' | 'codebase'>('microservices');
  const [microservicesStatus, setMicroservicesStatus] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  const copyToClipboard = (text: string, sectionId: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
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
    <ScrollView className="max-w-5xl mx-auto space-y-6 text-slate-800 dark:text-slate-200" showsVerticalScrollIndicator={false}>
      {/* Navigation Sub-Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row border-b border-slate-200 dark:border-slate-800 pb-2 space-x-2">
        {[
          { id: 'microservices', label: '1. Microservices & Event Bus', icon: Boxes },
          { id: 'architecture', label: '2. High-Level Architecture', icon: Layers },
          { id: 'schema', label: '3. Prisma Relational Schema', icon: Database },
          { id: 'endpoints', label: '4. REST API Specification', icon: Server },
          { id: 'codebase', label: '5. Docker Compose & Layout', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id as any)}
              className={`flex-row items-center gap-2 py-2 px-3.5 rounded-xl mr-2 ${
                isActive
                  ? 'bg-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              <Icon size={16} color={isActive ? '#ffffff' : '#94a3b8'} />
              <Text className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* SECTION 1: Microservices Decomposition */}
      {activeTab === 'microservices' && (
        <View className="space-y-6">
          {/* Microservices Topology ASCII Diagram */}
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <View className="flex-row items-center justify-between">
              <View>
                <View className="flex-row items-center gap-2">
                  <Boxes size={20} color="#059669" />
                  <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Microservices Topology & Decoupled Architecture
                  </Text>
                </View>
                <Text className="text-xs text-slate-500 mt-1">
                  Single Responsibilities • Independent Scalability • Event-Driven Asynchrony
                </Text>
              </View>

              <TouchableOpacity
                onPress={fetchMicroservicesTelemetry}
                disabled={isLoadingStatus}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <RefreshCw size={14} color="#64748b" className={isLoadingStatus ? 'animate-spin' : ''} />
                <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold ml-1">Refresh</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <Text className="text-emerald-400 font-mono text-[11px] leading-relaxed">
{`                       ┌───────────────────────────────┐
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
                   └───────────────────────────────────────┘`}
              </Text>
            </View>
          </View>

          {/* Live Microservices Health & Service Registry */}
          <View className="space-y-3">
            <View className="flex-row items-center gap-2">
              <Activity size={18} color="#10b981" />
              <Text className="font-extrabold text-slate-900 dark:text-white text-base">
                Live Microservice Registry & Health
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
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
                <View
                  key={svc.name}
                  className="w-full sm:w-[48%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-2 mb-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                      <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
                      <Text className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                        {svc.name}
                      </Text>
                    </View>
                    <View className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      <Text className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                        :{svc.port}
                      </Text>
                    </View>
                  </View>

                  <Text numberOfLines={2} className="text-xs text-slate-500 leading-snug">
                    {svc.desc}
                  </Text>

                  <View className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <Text className="text-[11px] text-slate-600 dark:text-slate-400">
                      DB: {svc.db}
                    </Text>
                    <Text className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                      {svc.events}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Real-Time Event Bus Activity Stream */}
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Radio size={18} color="#f59e0b" />
                <Text className="font-extrabold text-slate-900 dark:text-white text-base">
                  Message Broker Real-Time Event Stream
                </Text>
              </View>
              <Text className="text-xs text-slate-400">
                {liveEvents.length} Events Logged
              </Text>
            </View>

            <Text className="text-xs text-slate-500">
              When an action occurs (e.g. submitting a quiz in the mobile simulator or bookmarking a question), microservices emit decoupled events through the Message Broker.
            </Text>

            <View className="space-y-2">
              {liveEvents.length === 0 ? (
                <View className="py-6 items-center">
                  <Text className="text-xs text-slate-400">
                    Waiting for events... Practice a quiz in the Mobile Simulator to see events broadcast here live!
                  </Text>
                </View>
              ) : (
                liveEvents.slice(0, 5).map((evt, idx) => (
                  <View
                    key={evt.id || idx}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex-row items-start justify-between"
                  >
                    <View className="flex-1 mr-2">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-emerald-400 font-bold font-mono text-xs">
                          [{evt.type}]
                        </Text>
                        <Text className="text-slate-500 text-[11px]">
                          from {evt.sourceService}
                        </Text>
                      </View>
                      <Text numberOfLines={1} className="text-slate-400 text-[11px] font-mono mt-1">
                        Payload: {JSON.stringify(evt.payload)}
                      </Text>
                    </View>
                    <Text className="text-[10px] text-slate-500 font-mono">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      )}

      {/* SECTION 2: Complete Architecture & Auth */}
      {activeTab === 'architecture' && (
        <View className="space-y-5">
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <View className="flex-row items-center gap-2">
              <Layers size={20} color="#059669" />
              <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
                Complete System Architecture & Security Invariants
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between pt-2">
              <View className="w-full sm:w-[48%] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 mb-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <Shield size={16} color="#059669" />
                  <Text className="font-bold text-sm text-slate-900 dark:text-white">
                    Anti-Cheating Invariants
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  • Mobile Client never receives isCorrect during active quiz.{'\n'}
                  • Server evaluates scores, times, and submissions authoritatively.{'\n'}
                  • Idempotent submission locks prevent replay attacks.
                </Text>
              </View>

              <View className="w-full sm:w-[48%] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 mb-3">
                <View className="flex-row items-center gap-2 mb-2">
                  <Smartphone size={16} color="#059669" />
                  <Text className="font-bold text-sm text-slate-900 dark:text-white">
                    Offline First & SQLite Sync
                  </Text>
                </View>
                <Text className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  • Downloaded mock exams cached in local SQLite tables.{'\n'}
                  • Solved offline attempts queued and synced via batch endpoint.{'\n'}
                  • Zero latency instant response selection.
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* SECTION 3: Prisma Schema */}
      {activeTab === 'schema' && (
        <View className="space-y-4">
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Database size={20} color="#059669" />
                <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Prisma PostgreSQL Schema
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard('// Check prisma/schema.prisma in repository', 'schema')}
                className="flex-row items-center gap-1"
              >
                {copiedSection === 'schema' ? <CheckCircle size={14} color="#10b981" /> : <Copy size={14} color="#10b981" />}
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                  {copiedSection === 'schema' ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-slate-500">
              Normalized relational schema with indexes, cascades, UUID primary keys, and relations between Subject, Topic, Question, Option, Quiz, QuizAttempt, and Bookmarks.
            </Text>

            <View className="bg-slate-950 p-4 rounded-2xl">
              <Text className="text-slate-300 font-mono text-[11px] leading-relaxed">
{`model User {
  id           String        @id @default(uuid())
  email        String        @unique
  name         String
  passwordHash String
  avatarUrl    String?
  role         Role          @default(USER)
  refreshToken String?
  attempts     QuizAttempt[]
  bookmarks    Bookmark[]
  progress     UserProgress?
}

model Subject {
  id          String     @id @default(uuid())
  name        String     @unique
  code        String     @unique
  color       String     @default("#4F46E5")
  topics      Topic[]
  questions   Question[]
  quizzes     Quiz[]
}

model Question {
  id           String         @id @default(uuid())
  subjectId    String
  questionText String
  explanation  String
  difficulty   Difficulty     @default(MEDIUM)
  options      Option[]
  userAnswers  UserAnswer[]
  bookmarks    Bookmark[]
}

model QuizAttempt {
  id                String        @id @default(uuid())
  userId            String
  quizId            String
  startedAt         DateTime      @default(now())
  expiresAt         DateTime
  status            AttemptStatus @default(IN_PROGRESS)
  score             Float         @default(0)
  percentage        Float         @default(0)
  timeTaken         Int           @default(0)
}`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* SECTION 4: REST API Endpoints */}
      {activeTab === 'endpoints' && (
        <View className="space-y-4">
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <View className="flex-row items-center gap-2">
              <Server size={20} color="#059669" />
              <Text className="text-xl font-extrabold text-slate-900 dark:text-white">
                All REST API Endpoints (/api/v1)
              </Text>
            </View>

            <View className="space-y-2">
              {[
                { method: 'POST', path: '/api/v1/auth/login', svc: 'auth-service (:4001)', desc: 'Authenticates user, returns JWT tokens' },
                { method: 'POST', path: '/api/v1/auth/register', svc: 'auth-service (:4001)', desc: 'Registers new student with hashed password' },
                { method: 'GET', path: '/api/v1/subjects', svc: 'catalog-service (:4002)', desc: 'Lists all subjects with topic counts' },
                { method: 'GET', path: '/api/v1/quizzes', svc: 'catalog-service (:4002)', desc: 'Lists published quizzes with filters' },
                { method: 'POST', path: '/api/v1/quizzes/:id/start', svc: 'exam-service (:4003)', desc: 'Creates QuizAttempt without answers' },
                { method: 'POST', path: '/api/v1/quizzes/:id/submit', svc: 'exam-service (:4003)', desc: 'Server-side evaluation & event publish' },
                { method: 'GET', path: '/api/v1/attempts/:id', svc: 'exam-service (:4003)', desc: 'Returns scored answers & explanations' },
                { method: 'POST', path: '/api/v1/questions/:id/bookmark', svc: 'bookmarks-service (:4005)', desc: 'Bookmarks question for offline revision' },
                { method: 'GET', path: '/api/v1/users/me/statistics', svc: 'analytics-service (:4004)', desc: 'Returns subject accuracy breakdown' },
                { method: 'GET', path: '/api/v1/leaderboard', svc: 'analytics-service (:4004)', desc: 'Ranks users by score and accuracy' },
              ].map((ep, i) => (
                <View
                  key={i}
                  className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`px-2 py-0.5 rounded-md ${
                        ep.method === 'POST' ? 'bg-blue-100 dark:bg-blue-950/60' : 'bg-emerald-100 dark:bg-emerald-950/60'
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-extrabold font-mono ${
                          ep.method === 'POST' ? 'text-blue-700 dark:text-blue-300' : 'text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {ep.method}
                      </Text>
                    </View>
                    <Text className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                      {ep.path}
                    </Text>
                  </View>
                  <Text className="text-[11px] text-slate-500">
                    {ep.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* SECTION 5: Docker Compose */}
      {activeTab === 'codebase' && (
        <View className="space-y-4">
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
            <View className="flex-row items-center gap-2">
              <Terminal size={20} color="#059669" />
              <Text className="font-extrabold text-slate-900 dark:text-white text-base">
                Production docker-compose.yml
              </Text>
            </View>
            <Text className="text-xs text-slate-500">
              Orchestrates Edge Gateway, 5 Microservices, Redis Message Broker, and PostgreSQL cluster in an isolated bridge network.
            </Text>

            <View className="bg-slate-950 p-4 rounded-xl">
              <Text className="text-slate-300 font-mono text-[11px] leading-relaxed">
{`version: '3.8'

services:
  api-gateway:
    ports: ["3000:3000"]
    environment:
      - AUTH_SERVICE_URL=http://auth-service:4001
      - CATALOG_SERVICE_URL=http://catalog-service:4002
      - EXAM_SERVICE_URL=http://exam-service:4003
      - ANALYTICS_SERVICE_URL=http://analytics-service:4004
      - BOOKMARKS_SERVICE_URL=http://bookmarks-service:4005
      - REDIS_URL=redis://message-broker:6379

  auth-service:      # Port 4001: JWT, Passwords, Identity
  catalog-service:   # Port 4002: Subjects, Questions, Taxonomies
  exam-service:      # Port 4003: Timing, Anti-Cheat, Grading
  analytics-service: # Port 4004: Streaks, Leaderboards
  bookmarks-service: # Port 4005: Saved Collections
  message-broker:    # Port 6379: Redis Pub/Sub Topic
  postgres-db:       # Port 5432: PostgreSQL Cluster`}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};
