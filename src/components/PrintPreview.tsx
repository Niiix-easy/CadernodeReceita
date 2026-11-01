import React, { useState } from 'react';

interface PrintPreviewProps {
  onClose: () => void;
  onPrint: (sections: Record<string, boolean>) => void;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ onClose, onPrint }) => {
  const [sections, setSections] = useState({ comments: true, nutrition: true });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="card w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Pré-visualização de Impressão</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sections.comments} onChange={(e) => setSections({...sections, comments: e.target.checked})} />
            Incluir Comentários
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={sections.nutrition} onChange={(e) => setSections({...sections, nutrition: e.target.checked})} />
            Incluir Informações Nutricionais
          </label>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => onPrint(sections)}>Imprimir</button>
        </div>
      </div>
    </div>
  );
};
