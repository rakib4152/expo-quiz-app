import React, { useState } from 'react';
import {
  ArrowLeft,
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
} from 'lucide-react';
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

  // Indices of questions that have an answer
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

      // Offline mode submission: save into local SQLite queue
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
    } catch (e) {
      console.error('Failed to submit attempt:', e);
      // Fallback: save to offline SQLite if network dropped during submission!
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

  const handleTimerExpired = () => {
    // Automatically submit attempt on expiry
    handleSubmitAttempt();
  };

  if (!currentQ) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>No questions loaded for this quiz session.</p>
        <Button onClick={onExit} className="mt-4">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[580px] justify-between pb-4">
      {/* Top Header */}
      <div className="space-y-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowExitModal(true)}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            title="Exit quiz"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Question Count & Timer */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>

            {expiresAt && startedAt && (
              <QuizTimer
                startedAt={startedAt}
                expiresAt={expiresAt}
                onTimeExpired={handleTimerExpired}
              />
            )}
          </div>

          {/* Question Navigator Drawer trigger */}
          <button
            onClick={() => setIsNavigatorOpen(true)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Open Question Navigator"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <ProgressBar current={currentQuestionIndex + 1} total={totalQuestions} />
      </div>

      {/* Question & Answer Card */}
      <div className="flex-1 py-4 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {currentQ.difficulty || 'MEDIUM'} DIFFICULTY
          </span>
          <BookmarkButton questionId={currentQ.id} />
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.questionText}
        </h2>

        {/* Options */}
        <div className="space-y-2.5 pt-2">
          {currentQ.options.map((opt, idx) => (
            <OptionButton
              key={opt.id}
              index={idx}
              text={opt.optionText}
              isSelected={selectedAnswers[currentQ.id] === opt.id}
              onSelect={() => handleSelectOption(opt.id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <Button
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          size="md"
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        {isLastQuestion ? (
          <Button
            onClick={() => setShowSubmitModal(true)}
            size="md"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-4 h-4" />
            <span>Submit Quiz</span>
          </Button>
        ) : (
          <Button onClick={nextQuestion} size="md" className="flex-1">
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Submit Quiz?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review your response status before final evaluation:
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Total Questions</span>
                <span className="text-slate-900 dark:text-white font-bold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Answered</span>
                <span className="font-bold">{answeredCount}</span>
              </div>
              <div className="flex justify-between font-semibold text-amber-600 dark:text-amber-400">
                <span>Unanswered</span>
                <span className="font-bold">{unansweredCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1"
              >
                Continue Quiz
              </Button>
              <Button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmitAttempt();
                }}
                className="flex-1"
              >
                Submit Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Warning Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                Leave Quiz?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your current timer and answers will remain stored on your device, but time will continue to tick.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowExitModal(false)}
                className="flex-1"
              >
                Stay
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setShowExitModal(false);
                  onExit();
                }}
                className="flex-1"
              >
                Exit Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
