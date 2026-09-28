import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Clock, AlertTriangle } from 'lucide-react-native';

interface QuizTimerProps {
  startedAt: string;
  expiresAt: string;
  onTimeExpired: () => void;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ startedAt, expiresAt, onTimeExpired }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const end = new Date(expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((end - now) / 1000));
  });

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(expiresAt).getTime();
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((end - now) / 1000));
      setSecondsRemaining(remaining);

      if (remaining <= 0) {
        onTimeExpired();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, onTimeExpired]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 60 && secondsRemaining > 0;
  const isExpired = secondsRemaining === 0;

  return (
    <View
      className={`flex-row items-center px-3 py-1 rounded-full border ${
        isExpired
          ? 'bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800'
          : isUrgent
          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700'
          : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle size={14} color="#d97706" />
      ) : (
        <Clock size={14} color="#64748b" />
      )}
      <Text
        className={`ml-1.5 text-xs font-bold font-mono ${
          isExpired
            ? 'text-rose-700 dark:text-rose-400'
            : isUrgent
            ? 'text-amber-700 dark:text-amber-400'
            : 'text-slate-700 dark:text-slate-300'
        }`}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>
    </View>
  );
};
