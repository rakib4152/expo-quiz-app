import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  LogOut,
  Trophy,
  Award,
  Clock,
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../store/authStore.ts';
import { useNetwork } from '../store/networkStore.ts';
import { api } from '../services/api/client.ts';
import { sqliteDb, OfflineQuizRecord } from '../db/sqlite.ts';
import type { UserStatistics, QuizAttemptResult } from '../../types/quiz.ts';

interface ProfileScreenProps {
  onNavigateToReview: (attemptId: string) => void;
  onNavigateToQuiz: (quizId: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToReview,
  onNavigateToQuiz,
}) => {
  const { user, logout } = useAuth();
  const { isOnline, toggleNetwork, pendingAttempts, syncOfflineAttempts, isSyncing } = useNetwork();

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [offlineQuizzes, setOfflineQuizzes] = useState<OfflineQuizRecord[]>([]);
  const [history, setHistory] = useState<QuizAttemptResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get<UserStatistics>('/users/me/statistics'),
        api.get<QuizAttemptResult[]>('/users/me/attempts?limit=6'),
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (historyRes.data) setHistory(historyRes.data);
      setOfflineQuizzes(sqliteDb.getDownloadedQuizzes());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [isOnline]);

  const handleManualSync = async () => {
    const res = await syncOfflineAttempts();
    if (res.syncedCount > 0) {
      fetchProfileData();
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-full border-2 border-emerald-500 object-cover shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-slate-900 dark:text-white text-lg truncate">
              {user?.name || 'Rakib Ahmed'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'rakib.edu.bd@gmail.com'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Verified Scholar
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                BCS / Govt Exam Aspirant
              </span>
            </div>
          </div>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-white">
              {stats?.progress?.totalQuizzesCompleted ?? 6}
            </div>
            <div className="text-[10px] font-medium text-slate-400">Mocks Taken</div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats?.progress?.averageScore ?? 83.3}%
            </div>
            <div className="text-[10px] font-medium text-slate-400">Avg Accuracy</div>
          </div>
          <div>
            <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
              {stats?.progress?.streakDays ?? 4}d
            </div>
            <div className="text-[10px] font-medium text-slate-400">Daily Streak</div>
          </div>
        </div>
      </div>

      {/* Offline Mode & Network Switcher */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'}`}>
              {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Connectivity & Offline Mode
              </h4>
              <p className="text-xs text-slate-500">
                {isOnline ? 'Connected to REST backend' : 'Simulating offline taking mode'}
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={toggleNetwork}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              isOnline ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                isOnline ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Offline Queues and Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Downloaded Mocks: <span className="font-bold text-slate-900 dark:text-white">{offlineQuizzes.length}</span>
            </span>
            {pendingAttempts.length > 0 && (
              <span className="block text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                • {pendingAttempts.length} pending attempt(s) to sync
              </span>
            )}
          </div>

          {pendingAttempts.length > 0 && isOnline && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Performance Breakdown */}
      {stats?.subjectPerformance && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Subject Performance</span>
            </h3>
            <span className="text-xs text-slate-400">Overall Accuracy</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {stats.subjectPerformance.map((sub) => (
              <div key={sub.subjectId} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {sub.subjectName}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {sub.accuracy}% ({sub.correctAnswers}/{sub.totalQuestions})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${sub.accuracy}%`,
                      backgroundColor: sub.color || '#10B981',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz History */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Recent Quiz History</span>
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-500">
            No quiz attempts recorded yet.
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((att) => (
              <div
                key={att.attemptId || (att as any).id}
                onClick={() => onNavigateToReview(att.attemptId || (att as any).id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    {att.quizTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {att.correctAnswers}/{att.totalQuestions} correct • Time: {Math.floor(att.timeTaken / 60)}m {att.timeTaken % 60}s
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`font-extrabold text-xs px-2 py-0.5 rounded-md ${
                      att.percentage >= 70
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {att.percentage}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Action */}
      <button
        onClick={() => logout()}
        className="w-full py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out Account</span>
      </button>
    </div>
  );
};
