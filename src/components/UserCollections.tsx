import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

import { CollectionModal } from '@/components/CollectionModal';

export const UserCollections: React.FC = () => {
  const { user } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCollections = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_collections').select('*, collection_items(item_id)').eq('user_id', user.id);
    setCollections(data || []);
  };

  useEffect(() => {
    fetchCollections();
  }, [user]);

  const addCollection = async (name: string) => {
    if (!user) return;
    await supabase.from('user_collections').insert({ user_id: user.id, name });
    fetchCollections();
  };

  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Minhas Coleções</h2>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>Nova Coleção</button>
      </div>
      <CollectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={addCollection} />
      {collections.map(c => (
        <div key={c.id} className="p-3 border rounded-lg">
          <h3 className="font-bold">{c.name}</h3>
          <p className="text-xs text-muted">{c.collection_items.length} receitas</p>
        </div>
      ))}
    </div>
  );
};
