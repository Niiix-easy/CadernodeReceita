import React, { useState, useEffect } from 'react';

export const TutorialOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('tutorial_seen')) {
      setIsVisible(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('tutorial_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="card w-full max-w-lg space-y-4">
        <h2 className="text-xl font-bold">Bem-vindo ao Caderno de Receitas!</h2>
        <p>Este é o seu novo espaço. Aqui estão algumas dicas:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use a barra de busca para encontrar receitas.</li>
          <li>Filtre por categorias usando os botões acima.</li>
          <li>Check o Feed da Comunidade ao lado para ver o que estão postando!</li>
        </ul>
        <button className="btn-primary w-full" onClick={closeTutorial}>Entendido!</button>
      </div>
    </div>
  );
};
