import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  BookOpen,
  Home,
} from 'lucide-react-native';
import { api } from '../services/api/client.ts';
import { Button } from '../components/ui/Buttons.tsx';
import type { QuizAttemptResult } from '../../types/quiz.ts';

interface ResultScreenProps {
  attemptId: string;
  onReviewAnswers: (attemptId: string) => void;
  onBackToHome: () => void;
  onRetryQuiz?: (quizId: string) => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  attemptId,
  onReviewAnswers,
  onBackToHome,
}) => {
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    setLoading(true);
    try {
      const res = await api.get<QuizAttemptResult>(`/attempts/${attemptId}`);
      if (res.data) {
        setResult(res.data);
        if (res.data.percentage >= 60) {
          if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            import('canvas-confetti')
              .then((mod) => {
                mod.default({
                  particleCount: 80,
                  spread: 60,
                  origin: { y: 0.6 },
                });
              })
              .catch(() => {});
          }
        }
      }
    } catch (e) {
      console.error('Failed to load result:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <View className="flex-1 items-center justify-center py-20 space-y-3">
        <Sparkles size={32} color="#059669" />
        <Text className="text-xs font-bold text-slate-400">Evaluating your answers securely...</Text>
      </View>
    );
  }

  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;
  const isPass = result.percentage >= 60;

  return (
    <ScrollView className="flex-1 space-y-6 pb-12" showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View className="items-center space-y-2">
        <View className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-4 border-emerald-500/20 items-center justify-center mb-1">
          <Trophy size={40} color={isPass ? '#f59e0b' : '#94a3b8'} />
        </View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white">
          {isPass ? '🎉 Quiz Completed!' : 'Keep Practicing!'}
        </Text>
        <Text className="text-xs text-slate-500 text-center max-w-xs">
          {result.quizTitle}
        </Text>
      </View>

      {/* Score Card */}
      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-sm mx-auto w-full items-center space-y-4">
        <View className="items-center">
          <Text className="text-5xl font-black text-emerald-600 dark:text-emerald-400">
            {result.percentage}%
          </Text>
          <Text className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Total Score: {result.score} pts
          </Text>
        </View>

        {/* 4 Metrics Grid */}
        <View className="w-full flex-row flex-wrap justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <View className="w-[48%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex-row items-center mb-2.5">
            <CheckCircle2 size={20} color="#10b981" />
            <View className="ml-2.5">
              <Text className="font-extrabold text-slate-900 dark:text-white text-sm">
                {result.correctAnswers}
              </Text>
              <Text className="text-[10px] text-slate-400">Correct</Text>
            </View>
          </View>

          <View className="w-[48%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex-row items-center mb-2.5">
            <XCircle size={20} color="#f43f5e" />
            <View className="ml-2.5">
              <Text className="font-extrabold text-slate-900 dark:text-white text-sm">
                {result.incorrectAnswers}
              </Text>
              <Text className="text-[10px] text-slate-400">Incorrect</Text>
            </View>
          </View>

          <View className="w-[48%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex-row items-center">
            <HelpCircle size={20} color="#f59e0b" />
            <View className="ml-2.5">
              <Text className="font-extrabold text-slate-900 dark:text-white text-sm">
                {result.unansweredQuestions}
              </Text>
              <Text className="text-[10px] text-slate-400">Unanswered</Text>
            </View>
          </View>

          <View className="w-[48%] bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex-row items-center">
            <Clock size={20} color="#3b82f6" />
            <View className="ml-2.5">
              <Text className="font-extrabold text-slate-900 dark:text-white text-sm">
                {minutes}m {seconds}s
              </Text>
              <Text className="text-[10px] text-slate-400">Time Taken</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="space-y-3 max-w-sm mx-auto w-full">
        <Button
          onPress={() => onReviewAnswers(attemptId)}
          fullWidth
          size="lg"
        >
          <View className="flex-row items-center">
            <BookOpen size={18} color="#ffffff" />
            <Text className="text-white font-bold text-sm ml-2">Review Answers & Explanations</Text>
          </View>
        </Button>

        <Button
          onPress={onBackToHome}
          variant="outline"
          fullWidth
          size="md"
        >
          <View className="flex-row items-center">
            <Home size={16} color="#64748b" />
            <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs ml-1.5">
              Back to Home Dashboard
            </Text>
          </View>
        </Button>
      </View>
    </ScrollView>
  );
};
