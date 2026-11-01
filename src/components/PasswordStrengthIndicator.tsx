import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const calculateStrength = (p: string) => {
    let score = 0;
    if (!p) return 0;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[0-9]/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;
    return score;
  };

  const strength = calculateStrength(password);

  const getLabel = (s: number) => {
    if (s === 0) return '';
    if (s <= 25) return 'Fraca';
    if (s <= 50) return 'Média';
    if (s <= 75) return 'Boa';
    return 'Forte';
  };

  const getColor = (s: number) => {
    if (s <= 25) return 'bg-red-500';
    if (s <= 50) return 'bg-amber-500';
    if (s <= 75) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="space-y-1 mt-1">
      <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
        <span>Força da Senha</span>
        <span>{getLabel(strength)}</span>
      </div>
      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getColor(strength)}`} 
          style={{ width: `${strength}%` }}
        />
      </div>
    </div>
  );
};
