import React from 'react';
import { Link } from 'react-router-dom';
import { WifiOff } from 'lucide-react';

export const OfflineFallback: React.FC = () => {
  return (
    <div className="card text-center space-y-4 p-8">
      <WifiOff size={48} className="mx-auto text-muted" />
      <h2 className="text-2xl font-bold">Você está offline</h2>
      <p className="text-muted">Parece que sua conexão caiu. Algumas funcionalidades podem estar limitadas.</p>
      <Link to="/" className="btn-primary inline-block">Voltar para o Início</Link>
    </div>
  );
};
