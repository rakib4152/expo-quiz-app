import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

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
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono transition-colors ${
        isExpired
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          : isUrgent
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-700 animate-pulse'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
      }`}
    >
      {isUrgent ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      ) : (
        <Clock className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
