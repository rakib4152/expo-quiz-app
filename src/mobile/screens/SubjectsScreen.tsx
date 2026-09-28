import React, { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get<Subject[]>('/subjects');
      if (res.data) {
        setSubjects(res.data);
        if (selectedSubjectId) {
          const match = res.data.find((s: Subject) => s.id === selectedSubjectId);
          if (match) loadSubjectDetails(match);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectDetails = async (sub: Subject) => {
    setActiveSubject(sub);
    try {
      const [topicsRes, quizzesRes] = await Promise.all([
        api.get<Topic[]>(`/subjects/${sub.id}/topics`),
        api.get<Quiz[]>(`/quizzes?subjectId=${sub.id}`),
      ]);
      if (topicsRes.data) setTopics(topicsRes.data);
      if (quizzesRes.data) setSubjectQuizzes(quizzesRes.data);
    } catch (e) {
      console.error('Failed to load subject details:', e);
    }
  };

  if (activeSubject) {
    return (
      <div className="space-y-6 pb-20">
        <button
          onClick={() => {
            setActiveSubject(null);
            if (onClearSelectedSubject) onClearSelectedSubject();
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Subjects</span>
        </button>

        {/* Subject Header Banner */}
        <div
          className="rounded-3xl p-5 text-white shadow-md"
          style={{ backgroundColor: activeSubject.color }}
        >
          <span className="text-[11px] font-mono uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
            {activeSubject.code}
          </span>
          <h2 className="text-xl font-extrabold mt-2 leading-tight">
            {activeSubject.name}
          </h2>
          <p className="text-xs text-white/90 mt-1 leading-relaxed">
            {activeSubject.description}
          </p>
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/20 text-xs">
            <span>{topics.length} Topics</span>
            <span>•</span>
            <span>{subjectQuizzes.length} Quizzes Available</span>
          </div>
        </div>

        {/* Topics List */}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3">
            Syllabus Topics
          </h3>
          <div className="space-y-2.5">
            {topics.map((t, idx) => (
              <div
                key={t.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {t.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {t.description}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {t.questionsCount ?? 4} Qs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quizzes in this Subject */}
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3">
            Available Quizzes in this Subject
          </h3>
          <div className="space-y-3">
            {subjectQuizzes.map((q) => (
              <div
                key={q.id}
                onClick={() => onNavigateToQuiz(q.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500/50 cursor-pointer transition-all"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {q.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {q.totalQuestions} Questions • {q.duration} mins • {q.difficulty}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  Start <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Subjects & Syllabus
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Select a subject to drill down into topics and topic-specific mocks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {subjects.map((sub) => (
          <SubjectCard
            key={sub.id}
            subject={sub}
            onPress={() => loadSubjectDetails(sub)}
          />
        ))}
      </div>
    </div>
  );
};
