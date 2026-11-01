import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({ isOpen, onClose, itemId }) => {
  const [collections, setCollections] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      supabase.from('user_collections').select('*').then(({ data }) => setCollections(data || []));
    }
  }, [isOpen]);

  const addToCollection = async (collectionId: number) => {
    await supabase.from('collection_items').insert({ collection_id: collectionId, item_id: itemId });
    alert('Adicionado à coleção!');
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold">Adicionar à Coleção</h2>
        <ul className="space-y-2">
          {collections.map(c => (
            <button key={c.id} className="w-full text-left p-2 border rounded-lg hover:bg-sand" onClick={() => addToCollection(c.id)}>{c.name}</button>
          ))}
        </ul>
        <button className="btn-secondary w-full" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};
