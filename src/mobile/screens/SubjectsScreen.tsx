import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { api } from '../services/api/client.ts';
import { SubjectCard } from '../components/ui/Cards.tsx';
import type { Subject, Topic, Quiz } from '../../types/quiz.ts';

interface SubjectsScreenProps {
  onNavigateToQuiz: (quizId: string) => void;
  selectedSubjectId?: string | null;
  onClearSelectedSubject?: () => void;
}

export const SubjectsScreen: React.FC<SubjectsScreenProps> = ({
  onNavigateToQuiz,
  selectedSubjectId,
  onClearSelectedSubject,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectQuizzes, setSubjectQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get<Subject[]>('/subjects', { requiresAuth: false });
      if (res.data) {
        setSubjects(res.data);
        if (selectedSubjectId) {
          const match = res.data.find((s: Subject) => s.id === selectedSubjectId);
          if (match) loadSubjectDetails(match);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSubjectDetails = async (sub: Subject) => {
    setActiveSubject(sub);
    try {
      const [topicsRes, quizzesRes] = await Promise.all([
        api.get<Topic[]>(`/subjects/${sub.id}/topics`, { requiresAuth: false }),
        api.get<Quiz[]>(`/quizzes?subjectId=${sub.id}`, { requiresAuth: false }),
      ]);
      if (topicsRes.data) setTopics(topicsRes.data);
      if (quizzesRes.data) setSubjectQuizzes(quizzesRes.data);
    } catch (e) {
      console.error('Failed to load subject details:', e);
    }
  };

  if (activeSubject) {
    return (
      <ScrollView className="flex-1 space-y-6 pb-12" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => {
            setActiveSubject(null);
            if (onClearSelectedSubject) onClearSelectedSubject();
          }}
          className="flex-row items-center"
        >
          <ArrowLeft size={16} color="#64748b" />
          <Text className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
            Back to All Subjects
          </Text>
        </TouchableOpacity>

        {/* Subject Header Banner */}
        <View
          className="rounded-3xl p-5 shadow-sm"
          style={{ backgroundColor: activeSubject.color }}
        >
          <View className="bg-white/20 self-start px-2 py-0.5 rounded-full mb-1">
            <Text className="text-[10px] font-mono text-white font-bold uppercase">
              {activeSubject.code}
            </Text>
          </View>
          <Text className="text-xl font-black text-white mt-1">
            {activeSubject.name}
          </Text>
          <Text className="text-xs text-white/90 mt-1 leading-relaxed">
            {activeSubject.description}
          </Text>
          <View className="flex-row items-center space-x-2 mt-4 pt-3 border-t border-white/20">
            <Text className="text-xs text-white font-semibold">
              {topics.length} Topics • {subjectQuizzes.length} Quizzes Available
            </Text>
          </View>
        </View>

        {/* Topics List */}
        <View className="space-y-3">
          <Text className="font-black text-slate-900 dark:text-white text-base">
            Syllabus Topics
          </Text>
          <View className="space-y-2.5">
            {topics.map((t, idx) => (
              <View
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 items-center justify-center mr-3">
                    <Text className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-black text-slate-900 dark:text-white text-sm">
                      {t.name}
                    </Text>
                    <Text numberOfLines={1} className="text-xs text-slate-500 mt-0.5">
                      {t.description}
                    </Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {t.questionsCount ?? 4} Qs
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quizzes in this Subject */}
        <View className="space-y-3">
          <Text className="font-black text-slate-900 dark:text-white text-base">
            Available Quizzes
          </Text>
          <View className="space-y-2.5">
            {subjectQuizzes.map((q) => (
              <TouchableOpacity
                key={q.id}
                onPress={() => onNavigateToQuiz(q.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex-row items-center justify-between"
              >
                <View className="flex-1 mr-2">
                  <Text className="font-black text-slate-900 dark:text-white text-sm">
                    {q.title}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-0.5">
                    {q.totalQuestions} Questions • {q.duration} mins • {q.difficulty}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mr-1">
                    Start
                  </Text>
                  <ChevronRight size={14} color="#059669" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 space-y-5 pb-12" showsVerticalScrollIndicator={false}>
      <View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white">
          Subjects & Syllabus
        </Text>
        <Text className="text-xs text-slate-500 mt-0.5">
          Select a subject to drill down into topics and topic-specific mocks
        </Text>
      </View>

      <View className="space-y-3">
        {subjects.map((sub) => (
          <SubjectCard
            key={sub.id}
            subject={sub}
            onPress={() => loadSubjectDetails(sub)}
          />
        ))}
      </View>
    </ScrollView>
  );
};
