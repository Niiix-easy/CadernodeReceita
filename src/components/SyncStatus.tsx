import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const SyncStatus: React.FC = () => {
  const isOnline = useOnlineStatus();
  return (
    <div className={`fixed bottom-4 right-4 z-50 px-3 py-1 text-xs font-bold rounded-full text-white ${isOnline ? 'bg-emerald-600' : 'bg-red-600'}`}>
      {isOnline ? '● Online' : '○ Offline'}
    </div>
  );
};
