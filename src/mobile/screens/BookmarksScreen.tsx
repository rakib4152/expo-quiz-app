import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, CheckCircle2, BookOpen, AlertCircle } from 'lucide-react';
import { api } from '../services/api/client.ts';
import type { BookmarkItem } from '../../types/quiz.ts';

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
    <div className="space-y-5 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Questions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your bookmarked high-yield questions and explanations
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
          <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{bookmarks.length} Saved</span>
        </div>
      </div>

      {bookmarks.length === 0 && !loading ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No bookmarks yet
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
            Tap the bookmark icon on any question during or after a quiz to save it for revision.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bmk) => {
            const q = bmk.question;
            const correctOpt = q.options?.find((o) => o.isCorrect);

            return (
              <div
                key={bmk.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                      {q.subjectName || 'General'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {q.difficulty}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(q.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                  {q.questionText}
                </h3>

                {/* Options List */}
                <div className="space-y-1.5 pt-1">
                  {q.options?.map((opt, i) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                        opt.isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt.optionText}</span>
                      </div>
                      {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                    </div>
                  ))}
                </div>

                {/* Detailed Explanation */}
                {q.explanation && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                      Explanation:
                    </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
