import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const Collections: React.FC = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [newCol, setNewCol] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('collections').select('*').eq('user_id', user.id).then(({ data }) => setCollections(data || []));
  }, [user]);

  const createCollection = async () => {
    if (!user || !newCol.trim()) return;
    await supabase.from('collections').insert({ user_id: user.id, name: newCol });
    setNewCol('');
    // refresh list
  };

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold">Minhas Coleções</h2>
      <div className="flex gap-2">
        <input className="input" value={newCol} onChange={(e) => setNewCol(e.target.value)} placeholder="Nova coleção..." />
        <button className="btn-primary" onClick={createCollection}>Criar</button>
      </div>
      <ul className="space-y-2">
        {collections.map(c => <li key={c.id} className="p-2 border rounded-lg">{c.name}</li>)}
      </ul>
    </div>
  );
};
