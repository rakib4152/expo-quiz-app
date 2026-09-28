import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Flame, ArrowLeft, Crown } from 'lucide-react';
import { api } from '../services/api/client.ts';
import { useAuth } from '../store/authStore.ts';
import type { LeaderboardEntry } from '../../types/quiz.ts';

interface LeaderboardScreenProps {
  onBack?: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all-time'>('weekly');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard?timeframe=${timeframe}`);
      if (res.data?.leaderboard) {
        setEntries(res.data.leaderboard);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="space-y-6 pb-20">
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Leaderboard</span>
          <Trophy className="w-6 h-6 text-amber-500 fill-amber-500" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Top performers ranked by total mock exam score & accuracy
        </p>
      </div>

      {/* Timeframe Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400">
        {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 py-2 rounded-lg capitalize transition-all ${
              timeframe === t
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Podium Top 3 */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 pt-6 pb-2 items-end">
          {/* #2 Silver */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={top3[1]?.userAvatar}
                alt={top3[1]?.userName}
                className="w-14 h-14 rounded-full border-2 border-slate-300 dark:border-slate-600 shadow-md object-cover"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                2
              </span>
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[80px] text-center mt-1">
              {top3[1]?.userName.split(' ')[0]}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {top3[1]?.totalScore} pts
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-16 rounded-t-xl mt-2 flex items-center justify-center text-xs font-bold text-slate-400">
              🥈 2nd
            </div>
          </div>

          {/* #1 Gold Champion */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Crown className="w-6 h-6 text-amber-500 fill-amber-500 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <img
                src={top3[0]?.userAvatar}
                alt={top3[0]?.userName}
                className="w-18 h-18 rounded-full border-4 border-amber-400 shadow-lg object-cover ring-4 ring-amber-400/20"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-extrabold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                1
              </span>
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[90px] text-center mt-1">
              {top3[0]?.userName.split(' ')[0]}
            </p>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {top3[0]?.totalScore} pts
            </p>
            <div className="w-full bg-gradient-to-t from-amber-500 to-amber-400 text-white h-24 rounded-t-xl mt-2 flex items-center justify-center text-sm font-extrabold shadow-md">
              🥇 1st
            </div>
          </div>

          {/* #3 Bronze */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <img
                src={top3[2]?.userAvatar}
                alt={top3[2]?.userName}
                className="w-14 h-14 rounded-full border-2 border-amber-700/50 shadow-md object-cover"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                3
              </span>
            </div>
            <p className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[80px] text-center mt-1">
              {top3[2]?.userName.split(' ')[0]}
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {top3[2]?.totalScore} pts
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-12 rounded-t-xl mt-2 flex items-center justify-center text-xs font-bold text-amber-700">
              🥉 3rd
            </div>
          </div>
        </div>
      )}

      {/* Rankings List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Rankings
        </h3>
        {entries.map((entry) => {
          const isCurrentUser = user && entry.userId === user.id;

          return (
            <div
              key={entry.userId}
              className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                isCurrentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-center font-bold text-xs text-slate-500">
                  #{entry.rank}
                </span>
                <img
                  src={entry.userAvatar}
                  alt={entry.userName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {entry.userName}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-sm">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {entry.quizzesCompleted} mocks • {entry.accuracy}% accuracy
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {entry.totalScore}
                </div>
                <div className="text-[10px] font-semibold text-slate-400">Points</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
