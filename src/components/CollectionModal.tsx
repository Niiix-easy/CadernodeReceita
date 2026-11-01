import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const CollectionModal: React.FC<ModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold">Nova Coleção</h2>
        <input className="input" placeholder="Nome (ex: Receitas de Verão)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => { onSave(name); onClose(); setName(''); }}>Salvar</button>
        </div>
      </div>
    </div>
  );
};
