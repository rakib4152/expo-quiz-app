import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import {
  ArrowLeft,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react-native';
import { useQuizSession } from '../store/quizStore.ts';
import { useNetwork } from '../store/networkStore.ts';
import { api } from '../services/api/client.ts';
import { sqliteDb } from '../db/sqlite.ts';
import { QuizTimer } from '../components/ui/QuizTimer.tsx';
import { ProgressBar } from '../components/ui/ProgressBar.tsx';
import { OptionButton, BookmarkButton } from '../components/ui/Cards.tsx';
import { QuestionNavigator } from '../components/ui/QuestionNavigator.tsx';
import { Button } from '../components/ui/Buttons.tsx';
import type { QuizAttemptResult } from '../../types/quiz.ts';

interface QuizQuestionScreenProps {
  onCompleteQuiz: (attemptId: string) => void;
  onExit: () => void;
}

export const QuizQuestionScreen: React.FC<QuizQuestionScreenProps> = ({
  onCompleteQuiz,
  onExit,
}) => {
  const { session, selectAnswer, nextQuestion, prevQuestion, jumpToQuestion, setSubmitting } =
    useQuizSession();
  const { isOnline } = useNetwork();

  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  const { questions, currentQuestionIndex, selectedAnswers, startedAt, expiresAt, attemptId, quizId } =
    session;

  const currentQ = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const answeredIndices = questions
    .map((q, idx) => (selectedAnswers[q.id] ? idx : -1))
    .filter((idx) => idx !== -1);

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleSelectOption = (optionId: string) => {
    if (!currentQ) return;
    selectAnswer(currentQ.id, optionId);
  };

  const handleSubmitAttempt = async () => {
    if (!attemptId || !quizId) return;
    setSubmitting(true);

    const answersPayload = Object.entries(selectedAnswers).map(([qId, optId]) => ({
      questionId: qId,
      optionId: optId,
    }));

    try {
      if (isOnline && !session.isOfflineMode) {
        const res = await api.post<QuizAttemptResult>(`/quizzes/${quizId}/submit`, {
          attemptId,
          answers: answersPayload,
        });

        if (res.success && res.data) {
          onCompleteQuiz(res.data.attemptId);
          return;
        }
      }

      const now = new Date();
      const startedTime = startedAt ? new Date(startedAt).getTime() : Date.now();
      const timeTaken = Math.max(1, Math.round((now.getTime() - startedTime) / 1000));

      sqliteDb.saveOfflineAttempt({
        localId: attemptId,
        quizId,
        quizTitle: session.quizTitle,
        startedAt: startedAt || now.toISOString(),
        completedAt: now.toISOString(),
        timeTaken,
        status: 'SUBMITTED',
        answers: answersPayload,
      });

      onCompleteQuiz(attemptId);
    } catch {
      const now = new Date();
      sqliteDb.saveOfflineAttempt({
        localId: attemptId,
        quizId,
        quizTitle: session.quizTitle,
        startedAt: startedAt || now.toISOString(),
        completedAt: now.toISOString(),
        timeTaken: 60,
        status: 'SUBMITTED',
        answers: answersPayload,
      });
      onCompleteQuiz(attemptId);
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentQ) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-slate-500 text-center mb-4">
          No questions loaded for this quiz session.
        </Text>
        <Button onPress={onExit}>
          Return to Dashboard
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-between pb-4">
      {/* Top Header */}
      <View className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => setShowExitModal(true)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <ArrowLeft size={18} color="#64748b" />
          </TouchableOpacity>

          {/* Question Count & Timer */}
          <View className="flex-row items-center space-x-3">
            <Text className="text-xs font-black text-slate-800 dark:text-slate-200 mr-2">
              {currentQuestionIndex + 1} / {totalQuestions}
            </Text>

            {expiresAt && startedAt && (
              <QuizTimer
                startedAt={startedAt}
                expiresAt={expiresAt}
                onTimeExpired={handleSubmitAttempt}
              />
            )}
          </View>

          {/* Question Navigator Drawer trigger */}
          <TouchableOpacity
            onPress={() => setIsNavigatorOpen(true)}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800"
          >
            <LayoutGrid size={18} color="#059669" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
      </View>

      {/* Question & Answer Card */}
      <ScrollView className="flex-1 py-4 space-y-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <View className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            <Text className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
              {currentQ.difficulty || 'MEDIUM'} DIFFICULTY
            </Text>
          </View>
          <BookmarkButton questionId={currentQ.id} />
        </View>

        <Text className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-relaxed">
          {currentQ.questionText}
        </Text>

        {/* Options */}
        <View className="space-y-2.5 pt-2">
          {currentQ.options.map((opt, idx) => (
            <OptionButton
              key={opt.id}
              index={idx}
              text={opt.optionText}
              isSelected={selectedAnswers[currentQ.id] === opt.id}
              onSelect={() => handleSelectOption(opt.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation Buttons */}
      <View className="pt-3 border-t border-slate-100 dark:border-slate-800 flex-row items-center justify-between space-x-3">
        <View className="flex-1 mr-2">
          <Button
            onPress={prevQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            size="md"
            fullWidth
          >
            <View className="flex-row items-center">
              <ChevronLeft size={16} color="#64748b" />
              <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                Previous
              </Text>
            </View>
          </Button>
        </View>

        <View className="flex-1 ml-2">
          {isLastQuestion ? (
            <Button
              onPress={() => setShowSubmitModal(true)}
              size="md"
              fullWidth
              className="bg-emerald-600"
            >
              <View className="flex-row items-center">
                <Send size={16} color="#ffffff" />
                <Text className="text-xs font-bold text-white ml-1.5">Submit</Text>
              </View>
            </Button>
          ) : (
            <Button onPress={nextQuestion} size="md" fullWidth>
              <View className="flex-row items-center">
                <Text className="text-xs font-bold text-white mr-1">Next</Text>
                <ChevronRight size={16} color="#ffffff" />
              </View>
            </Button>
          )}
        </View>
      </View>

      {/* Question Navigator Modal */}
      <QuestionNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        totalQuestions={totalQuestions}
        currentIndex={currentQuestionIndex}
        answeredIndices={answeredIndices}
        onSelectQuestion={(idx) => jumpToQuestion(idx)}
      />

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <View className="absolute inset-0 z-50 bg-black/60 justify-center items-center p-4">
          <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <View className="items-center space-y-2">
              <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 items-center justify-center mb-1">
                <CheckCircle2 size={24} color="#059669" />
              </View>
              <Text className="font-black text-slate-900 dark:text-white text-lg">
                Submit Quiz?
              </Text>
              <Text className="text-xs text-slate-500 text-center">
                Review your response status before final evaluation:
              </Text>
            </View>

            <View className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-xs text-slate-500">Total Questions</Text>
                <Text className="text-xs text-slate-900 dark:text-white font-bold">{totalQuestions}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Answered</Text>
                <Text className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{answeredCount}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-amber-600 dark:text-amber-400 font-bold">Unanswered</Text>
                <Text className="text-xs text-amber-600 dark:text-amber-400 font-bold">{unansweredCount}</Text>
              </View>
            </View>

            <View className="flex-row items-center space-x-2 pt-2">
              <View className="flex-1 mr-1">
                <Button
                  variant="outline"
                  onPress={() => setShowSubmitModal(false)}
                  fullWidth
                >
                  Continue
                </Button>
              </View>
              <View className="flex-1 ml-1">
                <Button
                  onPress={() => {
                    setShowSubmitModal(false);
                    handleSubmitAttempt();
                  }}
                  fullWidth
                >
                  Submit Now
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Exit Warning Modal */}
      {showExitModal && (
        <View className="absolute inset-0 z-50 bg-black/60 justify-center items-center p-4">
          <View className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <View className="items-center space-y-2">
              <View className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 items-center justify-center mb-1">
                <AlertCircle size={24} color="#e11d48" />
              </View>
              <Text className="font-black text-slate-900 dark:text-white text-lg">
                Leave Quiz?
              </Text>
              <Text className="text-xs text-slate-500 text-center">
                Your current timer and answers will remain stored on your device, but time will continue to tick.
              </Text>
            </View>

            <View className="flex-row items-center space-x-2 pt-2">
              <View className="flex-1 mr-1">
                <Button
                  variant="outline"
                  onPress={() => setShowExitModal(false)}
                  fullWidth
                >
                  Stay
                </Button>
              </View>
              <View className="flex-1 ml-1">
                <Button
                  variant="danger"
                  onPress={() => {
                    setShowExitModal(false);
                    onExit();
                  }}
                  fullWidth
                >
                  Exit Quiz
                </Button>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};
