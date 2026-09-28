import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw,
  Award,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../store/authStore.ts';
import { useNetwork } from '../store/networkStore.ts';
import { api } from '../services/api/client.ts';
import { QuizCard, SubjectCard } from '../components/ui/Cards.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import type { Quiz, Subject, UserProgressData, LeaderboardEntry } from '../../types/quiz.ts';

interface HomeScreenProps {
  onNavigateToQuiz: (quizId: string) => void;
  onNavigateToSubject: (subjectId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onNavigateToLeaderboard: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToQuiz,
  onNavigateToSubject,
  onNavigateToTab,
  onNavigateToLeaderboard,
}) => {
  const { user } = useAuth();
  const { isOnline, pendingCount, syncOfflineAttempts, isSyncing } = useNetwork();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<UserProgressData | null>(null);
  const [topLeader, setTopLeader] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [quizRes, subRes, progRes, leadRes] = await Promise.all([
        api.get<Quiz[]>('/quizzes?limit=4'),
        api.get<Subject[]>('/subjects'),
        api.get<UserProgressData>('/users/me/progress'),
        api.get<{ leaderboard: LeaderboardEntry[] }>('/leaderboard'),
      ]);

      if (quizRes.data) setQuizzes(quizRes.data);
      if (subRes.data) setSubjects(subRes.data);
      if (progRes.data) setProgress(progRes.data);
      if (leadRes.data?.leaderboard?.length) setTopLeader(leadRes.data.leaderboard[0]);
    } catch (e) {
      console.error('Home load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  return (
    <div className="space-y-6 pb-20">
      {/* Offline banner if offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>Offline Mode Active • Saved quizzes available</span>
          </div>
          {pendingCount > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full">
              {pendingCount} attempt{pendingCount > 1 ? 's' : ''} to sync
            </span>
          )}
        </div>
      )}

      {/* Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY PREPARATION DASHBOARD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5 tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'Scholar'} 👋
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ready to test your knowledge today?
          </p>
        </div>

        {/* Streak & Sync Pill */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && isOnline && (
            <button
              onClick={() => syncOfflineAttempts()}
              disabled={isSyncing}
              className="flex items-center gap-1 text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-full"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync ({pendingCount})</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{progress?.streakDays || 4} Days Streak</span>
          </div>
        </div>
      </div>

      {/* Continue Learning Featured Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-5 text-white shadow-lg shadow-emerald-900/20">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-emerald-100 font-semibold mb-2">
          <span className="uppercase tracking-wider">Active Subject</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full">60% Mastered</span>
        </div>

        <h3 className="text-lg font-bold leading-snug">
          Bangladesh Affairs: Constitution & Liberation War
        </h3>
        <p className="text-xs text-emerald-100/90 mt-1 mb-4">
          12 of 20 high-yield questions practiced this week
        </p>

        <div className="space-y-1 mb-4">
          <ProgressBar current={12} total={20} color="bg-white" className="h-1.5" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Accuracy: 84%</span>
          </div>
          <button
            onClick={() => {
              if (quizzes[0]) onNavigateToQuiz(quizzes[0].id);
            }}
            className="inline-flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-transform active:scale-95 shadow-xs"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subjects Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Subjects
          </h2>
          <button
            onClick={() => onNavigateToTab('subjects')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {subjects.map((sub) => (
            <SubjectCard
              key={sub.id}
              subject={sub}
              onPress={(id) => onNavigateToSubject(id)}
            />
          ))}
        </div>
      </div>

      {/* Recommended Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recommended Quizzes
            </h2>
            <p className="text-xs text-slate-500">Hand-picked by performance</p>
          </div>
          <button
            onClick={() => onNavigateToTab('quizzes')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            <span>All Quizzes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onPress={(id) => onNavigateToQuiz(id)}
            />
          ))}
        </div>
      </div>

      {/* Progress & Leaderboard Snippet */}
      <div className="grid grid-cols-2 gap-3">
        {/* Your Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Your Progress</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white">
            {progress?.totalQuestionsAnswered || 42}
          </div>
          <p className="text-[11px] text-slate-500">Questions solved</p>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Avg Score: {progress?.averageScore || 83.3}%
          </div>
        </div>

        {/* Leaderboard Snippet */}
        <div
          onClick={onNavigateToLeaderboard}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Leaderboard</span>
            </div>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
            #3 <span className="text-xs font-normal text-slate-400">Rank</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            Top: {topLeader?.userName || 'Tanvir Hossain'}
          </p>
          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            View Ranking →
          </div>
        </div>
      </div>
    </div>
  );
};
