import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const AuthorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Get user recipes
      const { data: recipes } = await supabase.from('items').select('id, title').eq('user_id', user.id);
      if (!recipes) return;

      const statsPromises = recipes.map(async (recipe) => {
        const { data: favs } = await supabase.from('favorites').select('id', { count: 'exact' }).eq('item_id', recipe.id);
        const { data: ratings } = await supabase.from('ratings').select('rating').eq('item_id', recipe.id);
        
        const avgRating = ratings && ratings.length > 0 
            ? ratings.reduce((a, b) => a + b.rating, 0) / ratings.length 
            : 0;

        return { title: recipe.title, saves: favs?.length || 0, avgRating: avgRating.toFixed(1) };
      });

      const results = await Promise.all(statsPromises);
      setStats(results);
    })();
  }, [user]);

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold">Painel do Autor</h2>
      <div className="space-y-2">
        {stats.map((s, i) => (
          <div key={i} className="p-2 border rounded-lg text-sm flex justify-between">
            <span>{s.title}</span>
            <span>Salvos: {s.saves} | Nota: {s.avgRating}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
