import React from 'react';
import { View, Text } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  showLabel = false,
  color = 'bg-emerald-500',
  className = '',
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <View className={`w-full ${className}`}>
      {showLabel && (
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {current} of {total}
          </Text>
          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {percentage}%
          </Text>
        </View>
      )}
      <View className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
        <View
          className={`h-full ${color} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
};
