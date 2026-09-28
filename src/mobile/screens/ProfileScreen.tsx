import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import {
  LogOut,
  Award,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronRight,
} from 'lucide-react-native';
import { useAuth } from '../store/authStore.ts';
import { useNetwork } from '../store/networkStore.ts';
import { api } from '../services/api/client.ts';
import { sqliteDb, OfflineQuizRecord } from '../db/sqlite.ts';
import type { UserStatistics, QuizAttemptResult, SubjectPerformance } from '../../types/quiz.ts';

interface ProfileScreenProps {
  onNavigateToReview: (attemptId: string) => void;
  onNavigateToQuiz: (quizId: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigateToReview,
}) => {
  const { user, logout } = useAuth();
  const { isOnline, toggleNetwork, pendingAttempts, syncOfflineAttempts, isSyncing } = useNetwork();

  const [stats, setStats] = useState<UserStatistics | null>(null);
  const [offlineQuizzes, setOfflineQuizzes] = useState<OfflineQuizRecord[]>([]);
  const [history, setHistory] = useState<QuizAttemptResult[]>([]);

  const fetchProfileData = async () => {
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
    <ScrollView className="flex-1 space-y-6 pb-12" showsVerticalScrollIndicator={false}>
      {/* Profile Header Card */}
      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <View className="flex-row items-center">
          <Image
            source={{ uri: user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }}
            className="w-16 h-16 rounded-full border-2 border-emerald-500 mr-4"
          />
          <View className="flex-1">
            <Text className="font-black text-slate-900 dark:text-white text-lg">
              {user?.name || 'Rakib Ahmed'}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              {user?.email || 'rakib.edu.bd@gmail.com'}
            </Text>
            <View className="flex-row items-center space-x-2 mt-1.5">
              <View className="bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full mr-1.5">
                <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  Verified Scholar
                </Text>
              </View>
              <Text className="text-[10px] font-semibold text-slate-400">
                BCS Aspirant
              </Text>
            </View>
          </View>
        </View>

        {/* Aggregate Stats */}
        <View className="flex-row justify-around mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <View className="items-center">
            <Text className="text-lg font-black text-slate-900 dark:text-white">
              {stats?.progress?.totalQuizzesCompleted ?? 6}
            </Text>
            <Text className="text-[10px] font-medium text-slate-400">Mocks Taken</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {stats?.progress?.averageScore ?? 83.3}%
            </Text>
            <Text className="text-[10px] font-medium text-slate-400">Avg Accuracy</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-black text-amber-600 dark:text-amber-400">
              {stats?.progress?.streakDays ?? 4}d
            </Text>
            <Text className="text-[10px] font-medium text-slate-400">Daily Streak</Text>
          </View>
        </View>
      </View>

      {/* Offline Mode & Network Switcher */}
      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-2">
            <View className={`p-2.5 rounded-2xl mr-3 ${isOnline ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-amber-50 dark:bg-amber-950/40'}`}>
              {isOnline ? (
                <Wifi size={20} color="#059669" />
              ) : (
                <WifiOff size={20} color="#d97706" />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-extrabold text-slate-900 dark:text-white text-sm">
                Connectivity & Offline Mode
              </Text>
              <Text className="text-xs text-slate-500">
                {isOnline ? 'Connected to REST backend' : 'Simulating offline taking mode'}
              </Text>
            </View>
          </View>

          {/* Toggle Switch */}
          <TouchableOpacity
            onPress={toggleNetwork}
            className={`w-12 h-6 rounded-full justify-center p-0.5 ${
              isOnline ? 'bg-emerald-600 items-end' : 'bg-slate-300 dark:bg-slate-700 items-start'
            }`}
          >
            <View className="w-5 h-5 rounded-full bg-white shadow-xs" />
          </TouchableOpacity>
        </View>

        {/* Offline Queues and Actions */}
        <View className="pt-2 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Downloaded Mocks: <Text className="font-black text-slate-900 dark:text-white">{offlineQuizzes.length}</Text>
            </Text>
            {pendingAttempts.length > 0 && (
              <Text className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5">
                • {pendingAttempts.length} pending attempt(s) to sync
              </Text>
            )}
          </View>

          {pendingAttempts.length > 0 && isOnline && (
            <TouchableOpacity
              onPress={handleManualSync}
              disabled={isSyncing}
              className="flex-row items-center bg-emerald-600 px-3 py-1.5 rounded-xl"
            >
              <RefreshCw size={14} color="#ffffff" />
              <Text className="text-white font-bold text-xs ml-1.5">Sync Now</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Subject Performance Breakdown */}
      {stats?.subjectPerformance && (
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Award size={16} color="#059669" />
              <Text className="font-extrabold text-slate-900 dark:text-white text-sm ml-1.5">
                Subject Performance
              </Text>
            </View>
            <Text className="text-xs text-slate-400">Overall Accuracy</Text>
          </View>

          <View className="space-y-3 pt-1">
            {stats.subjectPerformance.map((sub: SubjectPerformance) => (
              <View key={sub.subjectId} className="space-y-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {sub.subjectName}
                  </Text>
                  <Text className="text-xs font-black text-slate-900 dark:text-white">
                    {sub.accuracy}% ({sub.correctAnswers}/{sub.totalQuestions})
                  </Text>
                </View>
                <View className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${sub.accuracy}%`,
                      backgroundColor: sub.color || '#10B981',
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Quiz History */}
      <View className="space-y-3">
        <View className="flex-row items-center">
          <Clock size={16} color="#94a3b8" />
          <Text className="font-extrabold text-slate-900 dark:text-white text-sm ml-1.5">
            Recent Quiz History
          </Text>
        </View>

        <View className="space-y-2">
          {history.map((att) => (
            <TouchableOpacity
              key={att.attemptId || (att as any).id}
              onPress={() => onNavigateToReview(att.attemptId || (att as any).id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex-row items-center justify-between"
            >
              <View className="flex-1 mr-2">
                <Text className="font-black text-slate-900 dark:text-white text-xs">
                  {att.quizTitle}
                </Text>
                <Text className="text-[11px] text-slate-500 mt-0.5">
                  {att.correctAnswers}/{att.totalQuestions} correct • Time: {Math.floor(att.timeTaken / 60)}m {att.timeTaken % 60}s
                </Text>
              </View>

              <View className="flex-row items-center">
                <View
                  className={`px-2 py-0.5 rounded-md mr-1.5 ${
                    att.percentage >= 70
                      ? 'bg-emerald-50 dark:bg-emerald-950/60'
                      : 'bg-amber-50 dark:bg-amber-950/60'
                  }`}
                >
                  <Text
                    className={`font-black text-xs ${
                      att.percentage >= 70
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {att.percentage}%
                  </Text>
                </View>
                <ChevronRight size={14} color="#94a3b8" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity
        onPress={() => logout()}
        className="w-full py-3.5 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 flex-row items-center justify-center"
      >
        <LogOut size={16} color="#e11d48" />
        <Text className="text-rose-600 dark:text-rose-400 text-xs font-bold ml-2">
          Log Out Account
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
