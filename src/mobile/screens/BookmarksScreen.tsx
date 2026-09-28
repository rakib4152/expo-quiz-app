import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Bookmark, Trash2, CheckCircle2 } from 'lucide-react-native';
import { api } from '../services/api/client.ts';
import type { BookmarkItem, Option } from '../../types/quiz.ts';

export const BookmarksScreen: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get<BookmarkItem[]>('/bookmarks');
      if (res.data) {
        setBookmarks(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemove = async (questionId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.questionId !== questionId));
    try {
      await api.delete(`/questions/${questionId}/bookmark`);
    } catch {
      fetchBookmarks();
    }
  };

  return (
    <ScrollView className="flex-1 space-y-5 pb-12" showsVerticalScrollIndicator={false}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="text-2xl font-black text-slate-900 dark:text-white">
            Saved Questions
          </Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            Review your bookmarked high-yield questions
          </Text>
        </View>
        <View className="flex-row items-center bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
          <Bookmark size={14} color="#f59e0b" fill="#f59e0b" />
          <Text className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
            {bookmarks.length} Saved
          </Text>
        </View>
      </View>

      {bookmarks.length === 0 && !loading ? (
        <View className="items-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <Bookmark size={40} color="#cbd5e1" />
          <Text className="font-extrabold text-slate-800 dark:text-slate-200 text-base mt-2">
            No bookmarks yet
          </Text>
          <Text className="text-xs text-slate-500 text-center max-w-xs mt-1">
            Tap the bookmark icon on any question during or after a quiz to save it for revision.
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          {bookmarks.map((bmk) => {
            const q = bmk.question;

            return (
              <View
                key={bmk.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-2">
                    <View className="bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full mr-1.5">
                      <Text className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        {q.subjectName || 'General'}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-semibold text-slate-400">
                      {q.difficulty}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(q.id)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50"
                  >
                    <Trash2 size={16} color="#e11d48" />
                  </TouchableOpacity>
                </View>

                <Text className="font-black text-slate-900 dark:text-white text-sm leading-snug">
                  {q.questionText}
                </Text>

                {/* Options List */}
                <View className="space-y-1.5 pt-1">
                  {q.options?.map((opt: Option, i: number) => (
                    <View
                      key={opt.id}
                      className={`p-2.5 rounded-2xl flex-row items-center justify-between ${
                        opt.isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/60'
                      }`}
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 items-center justify-center mr-2 border border-slate-200 dark:border-slate-700">
                          <Text className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            {String.fromCharCode(65 + i)}
                          </Text>
                        </View>
                        <Text
                          className={`text-xs flex-1 ${
                            opt.isCorrect
                              ? 'text-emerald-800 dark:text-emerald-200 font-bold'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.optionText}
                        </Text>
                      </View>
                      {opt.isCorrect && <CheckCircle2 size={16} color="#059669" />}
                    </View>
                  ))}
                </View>

                {/* Detailed Explanation */}
                {q.explanation && (
                  <View className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl p-3">
                    <Text className="font-extrabold text-slate-900 dark:text-white text-xs mb-0.5">
                      Explanation:
                    </Text>
                    <Text className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {q.explanation}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};
