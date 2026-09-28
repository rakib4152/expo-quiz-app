import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  TrendingUp,
  WifiOff,
  RefreshCw,
  Award,
} from 'lucide-react-native';
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

  const loadData = async () => {
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
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  return (
    <ScrollView className="flex-1 space-y-5 pb-8" showsVerticalScrollIndicator={false}>
      {/* Offline banner if offline */}
      {!isOnline && (
        <View className="bg-amber-500 px-4 py-2.5 rounded-2xl flex-row items-center justify-between">
          <View className="flex-row items-center">
            <WifiOff size={16} color="#ffffff" />
            <Text className="text-white text-xs font-bold ml-2">
              Offline Mode • Saved quizzes available
            </Text>
          </View>
          {pendingCount > 0 && (
            <View className="bg-white/20 px-2 py-0.5 rounded-full">
              <Text className="text-white text-[10px] font-bold">
                {pendingCount} to sync
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Greeting Header */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center">
            <Sparkles size={14} color="#059669" />
            <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1">
              DAILY PREPARATION DASHBOARD
            </Text>
          </View>
          <Text className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            Hello, {user?.name?.split(' ')[0] || 'Scholar'} 👋
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ready to test your knowledge today?
          </Text>
        </View>

        {/* Streak & Sync Pill */}
        <View className="flex-row items-center space-x-2">
          {pendingCount > 0 && isOnline && (
            <TouchableOpacity
              onPress={() => syncOfflineAttempts()}
              disabled={isSyncing}
              className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1.5 rounded-full mr-1.5"
            >
              <RefreshCw size={12} color="#059669" />
              <Text className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold ml-1">
                Sync ({pendingCount})
              </Text>
            </TouchableOpacity>
          )}

          <View className="flex-row items-center bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-full">
            <Flame size={14} color="#f59e0b" />
            <Text className="text-amber-700 dark:text-amber-400 text-xs font-bold ml-1">
              {progress?.streakDays || 4}d Streak
            </Text>
          </View>
        </View>
      </View>

      {/* Continue Learning Featured Card */}
      <View className="bg-emerald-700 rounded-3xl p-5 shadow-lg">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-xs text-emerald-100 font-bold uppercase tracking-wider">
            Active Subject
          </Text>
          <View className="bg-white/20 px-2 py-0.5 rounded-full">
            <Text className="text-white text-[10px] font-extrabold">60% Mastered</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-black leading-snug">
          Bangladesh Affairs: Constitution & Liberation War
        </Text>
        <Text className="text-xs text-emerald-100/90 mt-1 mb-4">
          12 of 20 high-yield questions practiced this week
        </Text>

        <ProgressBar current={12} total={20} color="bg-white" className="mb-4" />

        <View className="flex-row items-center justify-between pt-1">
          <View className="flex-row items-center">
            <TrendingUp size={14} color="#d1fae5" />
            <Text className="text-xs text-emerald-100 font-bold ml-1">Accuracy: 84%</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (quizzes[0]) onNavigateToQuiz(quizzes[0].id);
            }}
            className="flex-row items-center bg-white px-3.5 py-1.5 rounded-xl shadow-xs"
          >
            <Text className="text-emerald-800 text-xs font-bold mr-1">Continue</Text>
            <ArrowRight size={14} color="#065f46" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subjects Section */}
      <View className="space-y-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-extrabold text-slate-900 dark:text-white">
            Subjects
          </Text>
          <TouchableOpacity
            onPress={() => onNavigateToTab('subjects')}
            className="flex-row items-center"
          >
            <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-1">
              View All
            </Text>
            <ArrowRight size={12} color="#059669" />
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {subjects.map((sub) => (
            <View key={sub.id} className="w-[48%] mb-3">
              <SubjectCard
                subject={sub}
                onPress={(id) => onNavigateToSubject(id)}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Recommended Quizzes Section */}
      <View className="space-y-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-extrabold text-slate-900 dark:text-white">
              Recommended Quizzes
            </Text>
            <Text className="text-xs text-slate-500">Hand-picked by performance</Text>
          </View>
          <TouchableOpacity
            onPress={() => onNavigateToTab('quizzes')}
            className="flex-row items-center"
          >
            <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-1">
              All Quizzes
            </Text>
            <ArrowRight size={12} color="#059669" />
          </TouchableOpacity>
        </View>

        <View className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onPress={(id) => onNavigateToQuiz(id)}
              onDownloaded={() => loadData()}
            />
          ))}
        </View>
      </View>

      {/* Progress & Leaderboard Snippet */}
      <View className="flex-row justify-between mb-16">
        {/* Your Progress */}
        <View className="w-[48%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4">
          <View className="flex-row items-center mb-2">
            <Award size={16} color="#10b981" />
            <Text className="text-xs font-bold text-slate-500 ml-1.5">Progress</Text>
          </View>
          <Text className="text-xl font-black text-slate-900 dark:text-white">
            {progress?.totalQuestionsAnswered || 42}
          </Text>
          <Text className="text-[11px] text-slate-500">Questions solved</Text>
          <View className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Avg: {progress?.averageScore || 83.3}%
            </Text>
          </View>
        </View>

        {/* Leaderboard Snippet */}
        <TouchableOpacity
          onPress={onNavigateToLeaderboard}
          className="w-[48%] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Trophy size={16} color="#f59e0b" />
              <Text className="text-xs font-bold text-slate-500 ml-1.5">Leaderboard</Text>
            </View>
            <ArrowRight size={14} color="#94a3b8" />
          </View>
          <Text className="text-xl font-black text-amber-600 dark:text-amber-400">
            #3 <Text className="text-xs font-normal text-slate-400">Rank</Text>
          </Text>
          <Text numberOfLines={1} className="text-[11px] text-slate-500">
            Top: {topLeader?.userName || 'Tanvir Hossain'}
          </Text>
          <View className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800">
            <Text className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              View Ranking →
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
