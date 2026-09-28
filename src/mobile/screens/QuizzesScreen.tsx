import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Search, Sparkles } from 'lucide-react-native';
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

  const fetchFilters = async () => {
    try {
      const res = await api.get<Subject[]>('/subjects');
      if (res.data) setSubjects(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchQuizzes = async () => {
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
      console.error(e);
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
    <ScrollView className="flex-1 space-y-4 pb-12" showsVerticalScrollIndicator={false}>
      <View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white">
          Explore Quizzes
        </Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          Search, filter by subject & difficulty, and test your exam readiness
        </Text>
      </View>

      {/* Search Input Bar */}
      <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex-row items-center px-3.5 py-2.5">
        <Search size={16} color="#94a3b8" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search quizzes by title or keyword..."
          placeholderTextColor="#94a3b8"
          className="ml-2.5 flex-1 text-xs text-slate-900 dark:text-white"
        />
      </View>

      {/* Subject Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
        <TouchableOpacity
          onPress={() => setSelectedSubjectId('all')}
          className={`px-3 py-1.5 rounded-full mr-2 ${
            selectedSubjectId === 'all'
              ? 'bg-emerald-600'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              selectedSubjectId === 'all' ? 'text-white' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            All Subjects
          </Text>
        </TouchableOpacity>

        {subjects.map((sub) => (
          <TouchableOpacity
            key={sub.id}
            onPress={() => setSelectedSubjectId(sub.id)}
            className={`px-3 py-1.5 rounded-full mr-2 ${
              selectedSubjectId === sub.id
                ? 'bg-emerald-600'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-bold ${
                selectedSubjectId === sub.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {sub.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Difficulty Filters */}
      <View className="flex-row items-center space-x-1.5">
        {['all', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
          <TouchableOpacity
            key={diff}
            onPress={() => setSelectedDifficulty(diff)}
            className={`px-2.5 py-1 rounded-xl mr-1.5 ${
              selectedDifficulty === diff
                ? 'bg-slate-800 dark:bg-slate-700'
                : 'bg-slate-100 dark:bg-slate-800'
            }`}
          >
            <Text
              className={`text-[11px] font-extrabold uppercase ${
                selectedDifficulty === diff
                  ? 'text-white'
                  : 'text-slate-500'
              }`}
            >
              {diff === 'all' ? 'Any' : diff}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quiz List */}
      <View className="space-y-3">
        {quizzes.length === 0 ? (
          <View className="items-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
            <Sparkles size={28} color="#94a3b8" />
            <Text className="font-extrabold text-slate-700 dark:text-slate-300 text-sm mt-2">
              No quizzes found
            </Text>
            <Text className="text-xs text-slate-500 mt-1">Try changing your filters.</Text>
          </View>
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
      </View>
    </ScrollView>
  );
};
