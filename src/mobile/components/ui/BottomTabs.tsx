import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, BookOpen, HelpCircle, Bookmark, User } from 'lucide-react-native';

export type TabKey = 'home' | 'subjects' | 'quizzes' | 'bookmarks' | 'profile';

interface BottomTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  bookmarksCount?: number;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  activeTab,
  onSelectTab,
  bookmarksCount = 0,
}) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'Home', icon: Home },
    { key: 'subjects' as TabKey, label: 'Subjects', icon: BookOpen },
    { key: 'quizzes' as TabKey, label: 'Quizzes', icon: HelpCircle },
    { key: 'bookmarks' as TabKey, label: 'Saved', icon: Bookmark, badge: bookmarksCount > 0 ? bookmarksCount : undefined },
    { key: 'profile' as TabKey, label: 'Profile', icon: User },
  ];

  return (
    <View className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 py-2 px-3">
      <View className="flex-row items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
              className="items-center justify-center py-1 px-3"
            >
              <View className="relative">
                <Icon
                  size={20}
                  color={isActive ? '#059669' : '#94a3b8'}
                />
                {tab.badge && (
                  <View className="absolute -top-1 -right-2 bg-amber-500 w-4 h-4 rounded-full items-center justify-center">
                    <Text className="text-white text-[9px] font-extrabold">{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                className={`text-[10px] mt-1 font-semibold ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold'
                    : 'text-slate-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
