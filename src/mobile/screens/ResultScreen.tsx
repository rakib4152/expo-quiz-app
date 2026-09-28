import React, { useEffect, useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Home,
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
  onRetryQuiz,
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
          try {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {}
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
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
        <Sparkles className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="text-xs font-semibold">Evaluating your answers securely...</p>
      </div>
    );
  }

  const minutes = Math.floor(result.timeTaken / 60);
  const seconds = result.timeTaken % 60;
  const isPass = result.percentage >= 60;

  return (
    <div className="space-y-6 pb-20 text-center animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border-4 border-emerald-500/20 shadow-inner">
          <Trophy className={`w-10 h-10 ${isPass ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isPass ? '🎉 Quiz Completed!' : 'Keep Practicing!'}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {result.quizTitle}
        </p>
      </div>

      {/* Big Score Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs max-w-sm mx-auto space-y-4">
        <div>
          <div className="text-5xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {result.percentage}%
          </div>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
            Total Score: {result.score} pts
          </p>
        </div>

        {/* 4 Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-left">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {result.correctAnswers}
              </div>
              <div className="text-[10px] text-slate-400">Correct</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center gap-2.5">
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {result.incorrectAnswers}
              </div>
              <div className="text-[10px] text-slate-400">Incorrect</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {result.unansweredQuestions}
              </div>
              <div className="text-[10px] text-slate-400">Unanswered</div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                {minutes}m {seconds}s
              </div>
              <div className="text-[10px] text-slate-400">Time Taken</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 max-w-sm mx-auto">
        <Button
          onClick={() => onReviewAnswers(attemptId)}
          fullWidth
          size="lg"
          className="text-sm shadow-md shadow-emerald-500/20"
        >
          <BookOpen className="w-4 h-4" />
          <span>Review Answers & Explanations</span>
        </Button>

        <Button
          onClick={onBackToHome}
          variant="outline"
          fullWidth
          size="md"
          className="text-xs"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home Dashboard</span>
        </Button>
      </div>
    </div>
  );
};
