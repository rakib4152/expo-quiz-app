import React from 'react';
import { Home, BookOpen, HelpCircle, Bookmark, User } from 'lucide-react';

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
    <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 z-40">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative cursor-pointer select-none active:scale-90 ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
