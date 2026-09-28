import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
} from 'lucide-react-native';
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
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  if (loading || !quiz) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Sparkles size={28} color="#059669" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 space-y-6 pb-12" showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center"
        >
          <ArrowLeft size={16} color="#64748b" />
          <Text className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={downloading || isDownloaded}
          className={`flex-row items-center px-3 py-1.5 rounded-full border ${
            isDownloaded
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          {isDownloaded ? (
            <CheckCircle2 size={14} color="#059669" />
          ) : (
            <Download size={14} color="#64748b" />
          )}
          <Text
            className={`text-xs font-bold ml-1.5 ${
              isDownloaded
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {isDownloaded ? 'Downloaded' : downloading ? 'Downloading...' : 'Download Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quiz Banner & Meta */}
      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <View className="flex-row items-center space-x-2">
          {quiz.subject && (
            <View
              className="px-2.5 py-0.5 rounded-full mr-2"
              style={{ backgroundColor: `${quiz.subject.color}18` }}
            >
              <Text className="text-xs font-bold" style={{ color: quiz.subject.color }}>
                {quiz.subject.name}
              </Text>
            </View>
          )}
          <View className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {quiz.difficulty}
            </Text>
          </View>
        </View>

        <Text className="text-xl font-black text-slate-900 dark:text-white leading-snug">
          {quiz.title}
        </Text>

        <Text className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {quiz.description}
        </Text>

        {/* Specifications Grid */}
        <View className="flex-row justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <View className="w-[30%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl items-center">
            <HelpCircle size={20} color="#10b981" />
            <Text className="font-black text-sm text-slate-900 dark:text-white mt-1">
              {quiz.totalQuestions}
            </Text>
            <Text className="text-[10px] text-slate-400 font-medium">Questions</Text>
          </View>

          <View className="w-[30%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl items-center">
            <Clock size={20} color="#3b82f6" />
            <Text className="font-black text-sm text-slate-900 dark:text-white mt-1">
              {quiz.duration} mins
            </Text>
            <Text className="text-[10px] text-slate-400 font-medium">Time Limit</Text>
          </View>

          <View className="w-[30%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl items-center">
            <Trophy size={20} color="#f59e0b" />
            <Text className="font-black text-sm text-slate-900 dark:text-white mt-1">
              {quiz.userBestScore ? `${quiz.userBestScore}%` : '—'}
            </Text>
            <Text className="text-[10px] text-slate-400 font-medium">Your Best</Text>
          </View>
        </View>
      </View>

      {/* Exam Rules & Advice */}
      <View className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-4 space-y-2">
        <View className="flex-row items-center">
          <ShieldAlert size={16} color="#d97706" />
          <Text className="font-black text-xs text-amber-900 dark:text-amber-200 ml-1.5">
            Exam Rules & Anti-Cheating Protocol
          </Text>
        </View>
        <Text className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
          • 10 points awarded per correct answer. Scores evaluated strictly server-side.{'\n'}
          • Timer counts down continuously based on server timestamps.{'\n'}
          • Offline taking supported; attempts will synchronize automatically once reconnected.
        </Text>
      </View>

      {/* Start Button */}
      <Button
        onPress={handleStart}
        isLoading={starting}
        fullWidth
        size="lg"
      >
        <View className="flex-row items-center">
          <Play size={18} color="#ffffff" fill="#ffffff" />
          <Text className="text-white font-extrabold text-base ml-2">Start Quiz Now</Text>
        </View>
      </Button>
    </ScrollView>
  );
};
