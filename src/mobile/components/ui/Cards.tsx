import React, { useState } from 'react';
import {
  Clock,
  HelpCircle,
  Trophy,
  Download,
  CheckCircle2,
  Bookmark,
  ChevronRight,
  BookOpen,
  Landmark,
  Calculator,
  Cpu,
  Flame,
} from 'lucide-react';
import type { Quiz, Subject, Topic, Difficulty } from '../../../types/quiz.ts';
import { sqliteDb } from '../../db/sqlite.ts';
import { api } from '../../services/api/client.ts';

// 1. QuizCard
interface QuizCardProps {
  quiz: Quiz;
  onPress: (quizId: string) => void;
  onDownloaded?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onPress, onDownloaded }) => {
  const [isDownloaded, setIsDownloaded] = useState(() => sqliteDb.isQuizDownloaded(quiz.id));
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded) return;
    setIsDownloading(true);
    const success = await sqliteDb.downloadQuiz(quiz.id);
    setIsDownloading(false);
    if (success) {
      setIsDownloaded(true);
      if (onDownloaded) onDownloaded();
    }
  };

  const difficultyColors: Record<Difficulty, string> = {
    EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    HARD: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  };

  return (
    <div
      onClick={() => onPress(quiz.id)}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer relative"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {quiz.subject && (
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${quiz.subject.color}15`,
                color: quiz.subject.color,
              }}
            >
              {quiz.subject.name}
            </span>
          )}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[quiz.difficulty]}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Offline Download button */}
        <button
          onClick={handleDownload}
          disabled={isDownloading || isDownloaded}
          title={isDownloaded ? 'Downloaded for offline' : 'Download for offline use'}
          className={`p-1.5 rounded-lg text-xs transition-colors ${
            isDownloaded
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {isDownloaded ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce text-emerald-600' : ''}`} />
          )}
        </button>
      </div>

      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
        {quiz.title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
        {quiz.description}
      </p>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            {quiz.totalQuestions} Qs
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {quiz.duration} mins
          </span>
        </div>

        {quiz.userBestScore !== null && quiz.userBestScore !== undefined ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
            <Trophy className="w-3 h-3 text-emerald-600" />
            Best: {quiz.userBestScore}%
          </span>
        ) : (
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-0.5">
            Start <ChevronRight className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </div>
  );
};

// 2. SubjectCard
interface SubjectCardProps {
  subject: Subject;
  onPress: (id: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onPress }) => {
  const getIcon = () => {
    switch (subject.icon) {
      case 'Landmark':
        return <Landmark className="w-5 h-5 text-white" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-white" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-white" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-white" />;
      default:
        return <BookOpen className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div
      onClick={() => onPress(subject.id)}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
          style={{ backgroundColor: subject.color }}
        >
          {getIcon()}
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
          {subject.code}
        </span>
      </div>

      <div>
        <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
          {subject.name}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {subject.topicsCount ?? 3} Topics • {subject.questionsCount ?? 15} Questions
        </p>
      </div>

      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
        <span>Explore Topics</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

// 3. OptionButton
interface OptionButtonProps {
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  index,
  text,
  isSelected,
  onSelect,
  disabled = false,
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const letter = letters[index] || String(index + 1);

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all duration-150 flex items-start gap-3 select-none active:scale-[0.99] cursor-pointer ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div
        className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
          isSelected
            ? 'bg-emerald-500 text-white shadow-xs'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}
      >
        {letter}
      </div>
      <span className="text-sm font-medium leading-relaxed pt-0.5">{text}</span>
    </button>
  );
};

// 4. BookmarkButton
interface BookmarkButtonProps {
  questionId: string;
  initialBookmarked?: boolean;
  onToggle?: (isBookmarked: boolean) => void;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  questionId,
  initialBookmarked = false,
  onToggle,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    if (onToggle) onToggle(nextState);

    try {
      if (nextState) {
        await api.post(`/questions/${questionId}/bookmark`);
      } else {
        await api.delete(`/questions/${questionId}/bookmark`);
      }
    } catch {
      // Revert if failed
      setIsBookmarked(!nextState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Question'}
      className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${
        isBookmarked
          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <Bookmark
        className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
      />
    </button>
  );
};
