import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
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
} from 'lucide-react-native';
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

  const handleDownload = async () => {
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
    EASY: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    MEDIUM: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    HARD: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  };

  const difficultyTextColors: Record<Difficulty, string> = {
    EASY: 'text-emerald-700 dark:text-emerald-400',
    MEDIUM: 'text-amber-700 dark:text-amber-400',
    HARD: 'text-rose-700 dark:text-rose-400',
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(quiz.id)}
      activeOpacity={0.85}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-2">
          {quiz.subject && (
            <View
              className="px-2.5 py-0.5 rounded-full mr-1.5"
              style={{ backgroundColor: `${quiz.subject.color}15` }}
            >
              <Text
                className="text-[11px] font-bold"
                style={{ color: quiz.subject.color }}
              >
                {quiz.subject.name}
              </Text>
            </View>
          )}
          <View className={`px-2 py-0.5 rounded-full border ${difficultyColors[quiz.difficulty]}`}>
            <Text className={`text-[10px] font-extrabold ${difficultyTextColors[quiz.difficulty]}`}>
              {quiz.difficulty}
            </Text>
          </View>
        </View>

        {/* Offline Download button */}
        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading || isDownloaded}
          className={`p-1.5 rounded-xl ${
            isDownloaded
              ? 'bg-emerald-50 dark:bg-emerald-950/40'
              : 'bg-slate-100 dark:bg-slate-800'
          }`}
        >
          {isDownloaded ? (
            <CheckCircle2 size={16} color="#10b981" />
          ) : (
            <Download size={16} color={isDownloading ? '#059669' : '#94a3b8'} />
          )}
        </TouchableOpacity>
      </View>

      <Text className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
        {quiz.title}
      </Text>
      <Text numberOfLines={2} className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
        {quiz.description}
      </Text>

      <View className="flex-row items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center space-x-3">
          <View className="flex-row items-center mr-3">
            <HelpCircle size={14} color="#94a3b8" />
            <Text className="text-xs font-semibold text-slate-500 ml-1">
              {quiz.totalQuestions} Qs
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={14} color="#94a3b8" />
            <Text className="text-xs font-semibold text-slate-500 ml-1">
              {quiz.duration} mins
            </Text>
          </View>
        </View>

        {quiz.userBestScore !== null && quiz.userBestScore !== undefined ? (
          <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
            <Trophy size={12} color="#059669" />
            <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 ml-1">
              Best: {quiz.userBestScore}%
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Text className="text-[11px] font-bold text-slate-400 mr-0.5">Start</Text>
            <ChevronRight size={14} color="#94a3b8" />
          </View>
        )}
      </View>
    </TouchableOpacity>
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
        return <Landmark size={20} color="#ffffff" />;
      case 'BookOpen':
        return <BookOpen size={20} color="#ffffff" />;
      case 'Calculator':
        return <Calculator size={20} color="#ffffff" />;
      case 'Cpu':
        return <Cpu size={20} color="#ffffff" />;
      default:
        return <BookOpen size={20} color="#ffffff" />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(subject.id)}
      activeOpacity={0.85}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: subject.color }}
        >
          {getIcon()}
        </View>
        <View className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          <Text className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
            {subject.code}
          </Text>
        </View>
      </View>

      <Text className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">
        {subject.name}
      </Text>
      <Text numberOfLines={1} className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        {subject.topicsCount ?? 3} Topics • {subject.questionsCount ?? 15} Questions
      </Text>

      <View className="flex-row items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
        <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
          Explore Topics
        </Text>
        <ChevronRight size={14} color="#10b981" />
      </View>
    </TouchableOpacity>
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
    <Pressable
      onPress={onSelect}
      disabled={disabled}
      className={`w-full p-4 rounded-2xl border-2 flex-row items-start ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 shadow-xs'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
      }`}
    >
      <View
        className={`w-7 h-7 rounded-xl items-center justify-center mr-3 mt-0.5 ${
          isSelected
            ? 'bg-emerald-500'
            : 'bg-slate-100 dark:bg-slate-800'
        }`}
      >
        <Text
          className={`font-extrabold text-xs ${
            isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {letter}
        </Text>
      </View>
      <Text
        className={`flex-1 text-sm leading-relaxed font-semibold ${
          isSelected
            ? 'text-emerald-950 dark:text-emerald-100'
            : 'text-slate-800 dark:text-slate-200'
        }`}
      >
        {text}
      </Text>
    </Pressable>
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

  const toggle = async () => {
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
      setIsBookmarked(!nextState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      className={`p-2 rounded-xl ${
        isBookmarked
          ? 'bg-amber-50 dark:bg-amber-950/40'
          : 'bg-slate-100 dark:bg-slate-800'
      }`}
    >
      <Bookmark
        size={16}
        color={isBookmarked ? '#f59e0b' : '#94a3b8'}
        fill={isBookmarked ? '#f59e0b' : 'none'}
      />
    </TouchableOpacity>
  );
};
