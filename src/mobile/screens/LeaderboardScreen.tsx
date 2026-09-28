import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Trophy, ArrowLeft, Crown } from 'lucide-react-native';
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

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard?timeframe=${timeframe}`);
      if (res.data?.leaderboard) {
        setEntries(res.data.leaderboard);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const top3 = entries.slice(0, 3);

  return (
    <ScrollView className="flex-1 space-y-6 pb-12" showsVerticalScrollIndicator={false}>
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="flex-row items-center"
        >
          <ArrowLeft size={16} color="#64748b" />
          <Text className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
            Back to Home
          </Text>
        </TouchableOpacity>
      )}

      <View>
        <View className="flex-row items-center">
          <Text className="text-2xl font-black text-slate-900 dark:text-white mr-2">
            Leaderboard
          </Text>
          <Trophy size={22} color="#f59e0b" fill="#f59e0b" />
        </View>
        <Text className="text-xs text-slate-500 mt-0.5">
          Top performers ranked by total mock exam score & accuracy
        </Text>
      </View>

      {/* Timeframe Tabs */}
      <View className="flex-row p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {(['daily', 'weekly', 'monthly', 'all-time'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTimeframe(t)}
            className={`flex-1 py-2 items-center rounded-xl ${
              timeframe === t ? 'bg-white dark:bg-slate-900' : ''
            }`}
          >
            <Text
              className={`text-xs font-bold capitalize ${
                timeframe === t ? 'text-slate-900 dark:text-white' : 'text-slate-500'
              }`}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Podium Top 3 */}
      {top3.length >= 3 && (
        <View className="flex-row justify-between items-end pt-6 pb-2">
          {/* #2 Silver */}
          <View className="items-center w-[30%]">
            <Image
              source={{ uri: top3[1]?.userAvatar }}
              className="w-14 h-14 rounded-full border-2 border-slate-300 mb-1"
            />
            <Text numberOfLines={1} className="font-extrabold text-xs text-slate-900 dark:text-white">
              {top3[1]?.userName.split(' ')[0]}
            </Text>
            <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {top3[1]?.totalScore} pts
            </Text>
            <View className="w-full bg-slate-200 dark:bg-slate-800 h-16 rounded-t-2xl mt-2 items-center justify-center">
              <Text className="text-xs font-black text-slate-500">🥈 2nd</Text>
            </View>
          </View>

          {/* #1 Gold */}
          <View className="items-center w-[34%]">
            <Crown size={22} color="#f59e0b" fill="#f59e0b" />
            <Image
              source={{ uri: top3[0]?.userAvatar }}
              className="w-16 h-16 rounded-full border-4 border-amber-400 mb-1"
            />
            <Text numberOfLines={1} className="font-black text-xs text-slate-900 dark:text-white">
              {top3[0]?.userName.split(' ')[0]}
            </Text>
            <Text className="text-[11px] font-black text-amber-600 dark:text-amber-400">
              {top3[0]?.totalScore} pts
            </Text>
            <View className="w-full bg-amber-500 h-24 rounded-t-2xl mt-2 items-center justify-center shadow-md">
              <Text className="text-sm font-black text-white">🥇 1st</Text>
            </View>
          </View>

          {/* #3 Bronze */}
          <View className="items-center w-[30%]">
            <Image
              source={{ uri: top3[2]?.userAvatar }}
              className="w-14 h-14 rounded-full border-2 border-amber-700/60 mb-1"
            />
            <Text numberOfLines={1} className="font-extrabold text-xs text-slate-900 dark:text-white">
              {top3[2]?.userName.split(' ')[0]}
            </Text>
            <Text className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              {top3[2]?.totalScore} pts
            </Text>
            <View className="w-full bg-slate-200 dark:bg-slate-800 h-12 rounded-t-2xl mt-2 items-center justify-center">
              <Text className="text-xs font-black text-amber-700">🥉 3rd</Text>
            </View>
          </View>
        </View>
      )}

      {/* Rankings List */}
      <View className="space-y-2">
        <Text className="text-xs font-black uppercase text-slate-400 mb-1">
          Rankings
        </Text>
        {entries.map((entry) => {
          const isCurrentUser = user && entry.userId === user.id;

          return (
            <View
              key={entry.userId}
              className={`p-3.5 rounded-3xl flex-row items-center justify-between border ${
                isCurrentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <Text className="w-6 font-extrabold text-xs text-slate-500">
                  #{entry.rank}
                </Text>
                <Image
                  source={{ uri: entry.userAvatar }}
                  className="w-9 h-9 rounded-full mr-2.5"
                />
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="font-black text-slate-900 dark:text-white text-xs mr-1">
                      {entry.userName}
                    </Text>
                    {isCurrentUser && (
                      <View className="bg-emerald-600 px-1.5 py-0.2 rounded-sm">
                        <Text className="text-[9px] font-black text-white">YOU</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[11px] text-slate-500">
                    {entry.quizzesCompleted} mocks • {entry.accuracy}% accuracy
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="font-black text-sm text-slate-900 dark:text-white">
                  {entry.totalScore}
                </Text>
                <Text className="text-[10px] font-semibold text-slate-400">Points</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
