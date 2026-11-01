import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const SearchTrends: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('search_logs').select('query').then(({ data }) => {
        const counts: Record<string, number> = {};
        (data || []).forEach(l => counts[l.query] = (counts[l.query] || 0) + 1);
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        setTrends(sorted);
    });
  }, []);

  return (
    <div className="card space-y-2">
      <h2 className="text-lg font-bold">Buscas em Alta</h2>
      {trends.map(([query, count]) => (
        <div key={query} className="flex justify-between text-sm">
          <span>{query}</span>
          <span className="text-muted">{count} buscas</span>
        </div>
      ))}
    </div>
  );
};
