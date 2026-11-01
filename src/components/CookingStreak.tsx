import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getCookingStreak } from '@/lib/streaks';
import { useAuth } from '@/context/AuthContext';

export const CookingStreak: React.FC = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCookingStreak(user.id).then(s => {
      setStreak(s);
      setLoading(false);
    });
  }, [user]);

  if (loading || streak === 0) return null;

  return (
    <div className="card bg-orange-50 border-orange-200 flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <div className="bg-orange-500 p-2 rounded-full text-white">
          <Flame size={24} />
        </div>
        <div>
          <h3 className="font-bold text-orange-900">Sua Sequência!</h3>
          <p className="text-sm text-orange-800">Você está cozinhando há {streak} {streak === 1 ? 'dia' : 'dias'} seguidos.</p>
        </div>
      </div>
      <div className="text-2xl font-black text-orange-600">
        {streak}
      </div>
    </div>
  );
};
