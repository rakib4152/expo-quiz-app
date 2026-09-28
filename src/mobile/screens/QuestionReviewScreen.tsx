import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  Sparkles,
  Info,
} from 'lucide-react';
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
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Sparkles className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  const allQuestions = result.questions || [];
  const filteredQuestions = allQuestions.filter((q) => {
    if (filter === 'correct') return q.isCorrect;
    if (filter === 'incorrect') return !q.isCorrect;
    return true;
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Result</span>
        </button>

        <div className="text-xs font-bold text-slate-500">
          Score: {result.score} pts ({result.percentage}%)
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Answer Explanations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your answers against the official syllabus keys and detailed rationales
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : ''
          }`}
        >
          All ({allQuestions.length})
        </button>
        <button
          onClick={() => setFilter('incorrect')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'incorrect'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : ''
          }`}
        >
          Mistakes ({result.incorrectAnswers + result.unansweredQuestions})
        </button>
        <button
          onClick={() => setFilter('correct')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            filter === 'correct'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : ''
          }`}
        >
          Correct ({result.correctAnswers})
        </button>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const wasAnswered = q.selectedOptionId !== null;

          return (
            <div
              key={q.questionId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs space-y-3"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-500">
                    Q{idx + 1}
                  </span>
                  {q.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Correct (+10)
                    </span>
                  ) : wasAnswered ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      Incorrect
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      <HelpCircle className="w-3 h-3 text-amber-600" />
                      Unanswered
                    </span>
                  )}
                </div>

                <BookmarkButton questionId={q.questionId} initialBookmarked={q.isBookmarked} />
              </div>

              {/* Question Text */}
              <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                {q.questionText}
              </h3>

              {/* Options */}
              <div className="space-y-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = q.selectedOptionId === opt.id;
                  const isCorrect = opt.isCorrect;

                  let optionStyle =
                    'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                  let icon = null;

                  if (isCorrect) {
                    optionStyle =
                      'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/20';
                    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
                  } else if (isSelected && !isCorrect) {
                    optionStyle =
                      'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 font-medium';
                    icon = <XCircle className="w-4 h-4 text-rose-500 shrink-0" />;
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${optionStyle}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 text-[11px] font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed">{opt.optionText}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {isSelected && (
                          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                            Your Choice
                          </span>
                        )}
                        {icon}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Box */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-xl p-3.5 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300">
                  <Info className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Official Explanation & Rationale</span>
                </div>
                <p className="leading-relaxed pt-0.5 text-slate-600 dark:text-slate-300">
                  {q.explanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
