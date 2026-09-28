import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { api } from '../services/api/client.ts';
import { QuizCard } from '../components/ui/Cards.tsx';
import type { Quiz, Subject } from '../../types/quiz.ts';

interface QuizzesScreenProps {
  onNavigateToQuiz: (quizId: string) => void;
}

export const QuizzesScreen: React.FC<QuizzesScreenProps> = ({ onNavigateToQuiz }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [loading, setLoading] = useState(true);

  const fetchFilters = async () => {
    try {
      const res = await api.get<Subject[]>('/subjects');
      if (res.data) setSubjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedSubjectId !== 'all') params.append('subjectId', selectedSubjectId);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (sortBy) params.append('sort', sortBy);

      const res = await api.get<Quiz[]>(`/quizzes?${params.toString()}`);
      if (res.data) {
        setQuizzes(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch quizzes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuizzes();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, selectedSubjectId, selectedDifficulty, sortBy]);

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore Quizzes
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Search, filter by subject & difficulty, and test your exam readiness
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes by title or keyword..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
        />
      </div>

      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedSubjectId === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          All Subjects
        </button>
        {subjects.map((sub) => (
          <button
            key={sub.id}
            onClick={() => setSelectedSubjectId(sub.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSubjectId === sub.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Secondary Filters (Difficulty & Sort) */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {['all', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-slate-800 text-white dark:bg-slate-700'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {diff === 'all' ? 'Any' : diff}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort quizzes"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="popular">Most Popular</option>
          <option value="duration">Shortest First</option>
        </select>
      </div>

      {/* Quiz List */}
      <div className="space-y-3">
        {quizzes.length === 0 && !loading ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <Sparkles className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No quizzes found</h3>
            <p className="text-xs text-slate-500 mt-1">Try changing your search term or filters.</p>
          </div>
        ) : (
          quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onPress={(id) => onNavigateToQuiz(id)}
              onDownloaded={() => fetchQuizzes()}
            />
          ))
        )}
      </div>
    </div>
  );
};
