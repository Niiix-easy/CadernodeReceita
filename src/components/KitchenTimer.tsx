import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';

interface Timer {
  id: number;
  label: string;
  timeLeft: number;
  isRunning: boolean;
}

export const KitchenTimer: React.FC<{ prepTime?: number; cookTime?: number }> = ({ prepTime, cookTime }) => {
  const [timers, setTimers] = useState<Timer[]>([]);

  useEffect(() => {
    const newTimers = [];
    if (prepTime) newTimers.push({ id: 1, label: 'Preparo', timeLeft: prepTime * 60, isRunning: false });
    if (cookTime) newTimers.push({ id: 2, label: 'Cozimento', timeLeft: cookTime * 60, isRunning: false });
    setTimers(newTimers);
  }, [prepTime, cookTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(t => t.isRunning && t.timeLeft > 0 ? { ...t, timeLeft: t.timeLeft - 1 } : t));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {timers.map(t => (
        <div key={t.id} className="card flex items-center justify-between p-4 bg-sand border border-terracotta/20">
          <span className="font-bold">{t.label}: {formatTime(t.timeLeft)}</span>
          <button className="btn-secondary" onClick={() => setTimers(prev => prev.map(item => item.id === t.id ? {...item, isRunning: !item.isRunning} : item))}>
            {t.isRunning ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      ))}
    </div>
  );
};
