import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Info,
} from 'lucide-react-native';
import { api } from '../services/api/client.ts';
import { BookmarkButton } from '../components/ui/Cards.tsx';
import type { QuizAttemptResult, QuestionReviewItem } from '../../types/quiz.ts';

interface QuestionReviewScreenProps {
  attemptId: string;
  onBack: () => void;
}

export const QuestionReviewScreen: React.FC<QuestionReviewScreenProps> = ({
  attemptId,
  onBack,
}) => {
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReview();
  }, [attemptId]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const res = await api.get<QuizAttemptResult>(`/attempts/${attemptId}`);
      if (res.data) {
        setResult(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !result) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Sparkles size={28} color="#059669" />
      </View>
    );
  }

  const allQuestions = result.questions || [];
  const filteredQuestions = allQuestions.filter((q: QuestionReviewItem) => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    return true;
  });

  return (
    <ScrollView className="flex-1 space-y-5 pb-12" showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center"
        >
          <ArrowLeft size={16} color="#64748b" />
          <Text className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
            Back to Result
          </Text>
        </TouchableOpacity>

        <Text className="text-xs font-black text-slate-500">
          Score: {result.score} pts ({result.percentage}%)
        </Text>
      </View>

      <View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white">
          Answer Explanations
        </Text>
        <Text className="text-xs text-slate-500 mt-1">
          Review your answers against the official keys and detailed rationales
        </Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <TouchableOpacity
          onPress={() => setFilter('all')}
          className={`flex-1 py-2 items-center rounded-xl ${
            filter === 'all' ? 'bg-white dark:bg-slate-900' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              filter === 'all'
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-500'
            }`}
          >
            All ({allQuestions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('incorrect')}
          className={`flex-1 py-2 items-center rounded-xl ${
            filter === 'incorrect' ? 'bg-white dark:bg-slate-900' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              filter === 'incorrect'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500'
            }`}
          >
            Mistakes ({result.incorrectAnswers + result.unansweredQuestions})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFilter('correct')}
          className={`flex-1 py-2 items-center rounded-xl ${
            filter === 'correct' ? 'bg-white dark:bg-slate-900' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              filter === 'correct'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500'
            }`}
          >
            Correct ({result.correctAnswers})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Question Cards List */}
      <View className="space-y-4">
        {filteredQuestions.map((q: QuestionReviewItem, idx: number) => {
          const wasAnswered = q.selectedOptionId !== null;

          return (
            <View
              key={q.questionId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3"
            >
              {/* Card Header */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-2">
                  <Text className="font-black text-xs text-slate-500 mr-2">
                    Q{idx + 1}
                  </Text>
                  {q.isCorrect ? (
                    <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={12} color="#059669" />
                      <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 ml-1">
                        Correct (+10)
                      </Text>
                    </View>
                  ) : wasAnswered ? (
                    <View className="flex-row items-center bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                      <XCircle size={12} color="#e11d48" />
                      <Text className="text-[10px] font-bold text-rose-700 dark:text-rose-400 ml-1">
                        Incorrect
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      <HelpCircle size={12} color="#d97706" />
                      <Text className="text-[10px] font-bold text-amber-700 dark:text-amber-400 ml-1">
                        Unanswered
                      </Text>
                    </View>
                  )}
                </View>

                <BookmarkButton questionId={q.questionId} initialBookmarked={q.isBookmarked} />
              </View>

              {/* Question Text */}
              <Text className="font-black text-slate-900 dark:text-white text-sm leading-snug">
                {q.questionText}
              </Text>

              {/* Options */}
              <View className="space-y-2 pt-1">
                {q.options.map((opt: any, optIdx: number) => {
                  const isSelected = q.selectedOptionId === opt.id;
                  const isCorrect = opt.isCorrect;

                  let cardStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40';
                  let textColor = 'text-slate-700 dark:text-slate-300';

                  if (isCorrect) {
                    cardStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                    textColor = 'text-emerald-900 dark:text-emerald-100 font-bold';
                  } else if (isSelected && !isCorrect) {
                    cardStyle = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40';
                    textColor = 'text-rose-900 dark:text-rose-100 font-semibold';
                  }

                  return (
                    <View
                      key={opt.id}
                      className={`p-3 rounded-2xl border flex-row items-center justify-between ${cardStyle}`}
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 items-center justify-center mr-2 border border-slate-200 dark:border-slate-700">
                          <Text className="text-[11px] font-black text-slate-700 dark:text-slate-300">
                            {String.fromCharCode(65 + optIdx)}
                          </Text>
                        </View>
                        <Text className={`text-xs leading-relaxed flex-1 ${textColor}`}>
                          {opt.optionText}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        {isSelected && (
                          <Text className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">
                            Your Choice
                          </Text>
                        )}
                        {isCorrect && <CheckCircle2 size={16} color="#059669" />}
                        {isSelected && !isCorrect && <XCircle size={16} color="#e11d48" />}
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Explanation Box */}
              <View className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-3.5 space-y-1">
                <View className="flex-row items-center">
                  <Info size={14} color="#059669" />
                  <Text className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 ml-1.5">
                    Official Explanation & Rationale
                  </Text>
                </View>
                <Text className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-1">
                  {q.explanation}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
