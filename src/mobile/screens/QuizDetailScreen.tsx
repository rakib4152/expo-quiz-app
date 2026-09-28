import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  Trophy,
  Download,
  CheckCircle2,
  Play,
  ShieldAlert,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api/client.ts';
import { sqliteDb } from '../db/sqlite.ts';
import { useQuizSession } from '../store/quizStore.ts';
import { useNetwork } from '../store/networkStore.ts';
import { Button } from '../components/ui/Buttons.tsx';
import type { Quiz, QuizAttemptStartResponse } from '../../types/quiz.ts';

interface QuizDetailScreenProps {
  quizId: string;
  onBack: () => void;
  onStartQuiz: () => void;
}

export const QuizDetailScreen: React.FC<QuizDetailScreenProps> = ({
  quizId,
  onBack,
  onStartQuiz,
}) => {
  const { initSession } = useQuizSession();
  const { isOnline } = useNetwork();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(() => sqliteDb.isQuizDownloaded(quizId));
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await api.get<Quiz>(`/quizzes/${quizId}`);
      if (res.data) setQuiz(res.data);
    } catch {
      // Fallback if offline
      const offlineList = sqliteDb.getDownloadedQuizzes();
      const match = offlineList.find((q) => q.id === quizId);
      if (match) {
        setQuiz({
          id: match.id,
          title: match.title,
          description: match.description,
          duration: match.duration,
          totalQuestions: match.totalQuestions,
          difficulty: match.difficulty,
          isPublished: true,
          createdAt: match.downloadedAt,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (isDownloaded || downloading) return;
    setDownloading(true);
    const success = await sqliteDb.downloadQuiz(quizId);
    setDownloading(false);
    if (success) setIsDownloaded(true);
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      if (isOnline) {
        const res = await api.post<QuizAttemptStartResponse>(`/quizzes/${quizId}/start`);
        if (res.success && res.data) {
          initSession(res.data, false);
          onStartQuiz();
          return;
        }
      }

      // Offline flow: start from local SQLite cache
      const offlineQuestions = sqliteDb.getOfflineQuestions(quizId);
      const now = new Date();
      const durationMins = quiz?.duration || 10;
      const expiresAt = new Date(now.getTime() + durationMins * 60 * 1000);

      const localStartData: QuizAttemptStartResponse = {
        attemptId: `att_offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        quizId: quizId,
        quizTitle: quiz?.title || 'Quiz',
        duration: durationMins,
        startedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        totalQuestions: offlineQuestions.length || (quiz?.totalQuestions ?? 5),
        questions: offlineQuestions.map((q) => ({
          id: q.id,
          questionText: q.questionText,
          difficulty: q.difficulty,
          options: q.options.map((o) => ({ id: o.id, optionText: o.optionText })),
        })),
      };

      initSession(localStartData, true);
      onStartQuiz();
    } catch (e) {
      console.error('Failed to start quiz attempt:', e);
    } finally {
      setStarting(false);
    }
  };

  if (loading || !quiz) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Sparkles className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleDownload}
          disabled={downloading || isDownloaded}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
            isDownloaded
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
          }`}
        >
          {isDownloaded ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Ready</span>
            </>
          ) : (
            <>
              <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : ''}`} />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </>
          )}
        </button>
      </div>

      {/* Quiz Banner & Meta */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {quiz.subject && (
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${quiz.subject.color}18`,
                color: quiz.subject.color,
              }}
            >
              {quiz.subject.name}
            </span>
          )}
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {quiz.difficulty}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          {quiz.title}
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {quiz.description}
        </p>

        {/* Specifications Grid */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
            <HelpCircle className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {quiz.totalQuestions}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Questions</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
            <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {quiz.duration} mins
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Time Limit</div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-center">
            <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="font-extrabold text-sm text-slate-900 dark:text-white">
              {quiz.userBestScore ? `${quiz.userBestScore}%` : '—'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Your Best</div>
          </div>
        </div>
      </div>

      {/* Exam Rules & Advice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-4 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>Exam Rules & Instructions</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          <li>10 marks awarded per correct answer.</li>
          <li>Answers are evaluated securely on the backend; no answer keys are leaked to the client.</li>
          <li>Server-synced timer counts down continuously even if the app changes focus.</li>
          <li>You can navigate freely back and forth between questions using the Question Navigator.</li>
        </ul>
      </div>

      {/* Start Button */}
      <Button
        onClick={handleStart}
        isLoading={starting}
        fullWidth
        size="lg"
        className="text-base py-4 shadow-lg shadow-emerald-500/25"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>Start Quiz Now</span>
      </Button>
    </div>
  );
};
