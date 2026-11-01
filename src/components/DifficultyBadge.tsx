import React from 'react';

interface DifficultyBadgeProps {
  level: string | null;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ level }) => {
  if (!level) return null;
  
  const getBadgeStyles = (level: string) => {
    switch (level) {
      case 'Fácil': return 'bg-[var(--diff-easy)]';
      case 'Médio': return 'bg-[var(--diff-medium)]';
      case 'Difícil': return 'bg-[var(--diff-hard)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-semibold ${getBadgeStyles(level)}`}>
      {level}
    </span>
  );
};
