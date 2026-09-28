import { useState, useEffect } from 'react';
import type { QuizAttemptStartResponse } from '../../types/quiz.ts';

export interface QuizSessionState {
  attemptId: string | null;
  quizId: string | null;
  quizTitle: string;
  duration: number; // minutes
  startedAt: string | null;
  expiresAt: string | null;
  questions: Array<{
    id: string;
    questionText: string;
    difficulty: string;
    options: Array<{ id: string; optionText: string }>;
  }>;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>; // questionId -> optionId
  isSubmitting: boolean;
  isOfflineMode: boolean;
}

let activeSession: QuizSessionState = {
  attemptId: null,
  quizId: null,
  quizTitle: '',
  duration: 10,
  startedAt: null,
  expiresAt: null,
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  isSubmitting: false,
  isOfflineMode: false,
};

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function useQuizSession() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const initSession = (startData: QuizAttemptStartResponse, isOffline: boolean = false) => {
    activeSession = {
      attemptId: startData.attemptId,
      quizId: startData.quizId,
      quizTitle: startData.quizTitle,
      duration: startData.duration,
      startedAt: startData.startedAt,
      expiresAt: startData.expiresAt,
      questions: startData.questions,
      currentQuestionIndex: 0,
      selectedAnswers: {},
      isSubmitting: false,
      isOfflineMode: isOffline,
    };
    notify();
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    activeSession.selectedAnswers = {
      ...activeSession.selectedAnswers,
      [questionId]: optionId,
    };
    notify();
  };

  const nextQuestion = () => {
    if (activeSession.currentQuestionIndex < activeSession.questions.length - 1) {
      activeSession.currentQuestionIndex++;
      notify();
    }
  };

  const prevQuestion = () => {
    if (activeSession.currentQuestionIndex > 0) {
      activeSession.currentQuestionIndex--;
      notify();
    }
  };

  const jumpToQuestion = (index: number) => {
    if (index >= 0 && index < activeSession.questions.length) {
      activeSession.currentQuestionIndex = index;
      notify();
    }
  };

  const clearSession = () => {
    activeSession = {
      attemptId: null,
      quizId: null,
      quizTitle: '',
      duration: 10,
      startedAt: null,
      expiresAt: null,
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: {},
      isSubmitting: false,
      isOfflineMode: false,
    };
    notify();
  };

  const setSubmitting = (submitting: boolean) => {
    activeSession.isSubmitting = submitting;
    notify();
  };

  return {
    session: activeSession,
    initSession,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    jumpToQuestion,
    clearSession,
    setSubmitting,
  };
}
