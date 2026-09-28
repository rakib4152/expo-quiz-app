import React from 'react';
import { X, Check, HelpCircle, ArrowRight } from 'lucide-react';

interface QuestionNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  answeredIndices: number[];
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answeredIndices,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  const answeredSet = new Set(answeredIndices);
  const answeredCount = answeredIndices.length;
  const unansweredCount = totalQuestions - answeredCount;

  // Find first unanswered question
  const nextUnansweredIndex = Array.from({ length: totalQuestions }, (_, i) => i).find(
    (i) => !answeredSet.has(i)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Question Navigator</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {answeredCount} answered • {unansweredCount} remaining
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 py-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>Answered ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></span>
            <span>Unanswered ({unansweredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full border-2 border-emerald-600"></span>
            <span>Current</span>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-5 gap-2.5 my-3 max-h-60 overflow-y-auto p-1">
          {Array.from({ length: totalQuestions }, (_, index) => {
            const isAnswered = answeredSet.has(index);
            const isCurrent = currentIndex === index;

            return (
              <button
                key={index}
                onClick={() => {
                  onSelectQuestion(index);
                  onClose();
                }}
                className={`h-11 rounded-xl font-semibold text-sm flex items-center justify-center relative transition-all active:scale-95 ${
                  isCurrent
                    ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 ring-offset-2 dark:ring-offset-slate-900 font-bold'
                    : ''
                } ${
                  isAnswered
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{index + 1}</span>
                {isAnswered ? (
                  <Check className="w-3 h-3 absolute top-1 right-1 opacity-80" />
                ) : (
                  <HelpCircle className="w-2.5 h-2.5 absolute top-1 right-1 opacity-40" />
                )}
              </button>
            );
          })}
        </div>

        {/* Jump to unanswered shortcut */}
        {nextUnansweredIndex !== undefined && (
          <button
            onClick={() => {
              onSelectQuestion(nextUnansweredIndex);
              onClose();
            }}
            className="w-full mt-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Jump to Next Unanswered (Q{nextUnansweredIndex + 1})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
