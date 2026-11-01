import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const ActivityDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: favs } = await supabase.from('favorites').select('created_at').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString());
      const { data: list } = await supabase.from('shopping_list').select('created_at').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString());
      
      const combined = [...(favs || []), ...(list || [])];
      const counts: Record<string, number> = {};
      
      combined.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString('pt-BR');
        counts[date] = (counts[date] || 0) + 1;
      });
      
      setData(Object.entries(counts).map(([date, count]) => ({ date, count })));
    })();
  }, [user]);

  return (
    <div className="h-64 w-full">
      <h2 className="text-lg font-bold mb-4">Atividade nos Últimos 30 Dias</h2>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#E28B6E" fill="#E28B6E" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
