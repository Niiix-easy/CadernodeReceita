import React from 'react';

const SUBSTITUTIONS: Record<string, string> = {
  "manteiga": "pode substituir por óleo vegetal ou iogurte",
  "ovo": "pode substituir por farinha de linhaça com água",
  "leite": "pode substituir por leite vegetal (amêndoas, aveia)",
  "açúcar": "pode substituir por mel ou adoçante culinário",
  "farinha": "pode substituir por farinha de aveia ou amêndoas"
};

export const QuickTips: React.FC<{ ingredient: string }> = ({ ingredient }) => {
  if (!ingredient || ingredient.length < 3) return null;
  const tips = Object.entries(SUBSTITUTIONS)
    .filter(([key]) => ingredient.toLowerCase().includes(key))
    .map(([key, tip]) => `${key}: ${tip}`);
    
  if (tips.length === 0) return null;
  
  return (
    <div className="text-xs text-terracotta-dark bg-sand p-2 rounded mt-1">
      {tips.map((t, i) => <p key={i}>{t}</p>)}
    </div>
  );
};
