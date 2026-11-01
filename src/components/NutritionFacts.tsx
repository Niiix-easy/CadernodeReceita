import React from 'react';

export const NutritionFacts: React.FC<{ nutrition: any }> = ({ nutrition }) => {
  if (!nutrition) return null;
  return (
    <div className="grid grid-cols-4 gap-2 text-xs bg-sand p-2 rounded">
      <div><strong>Calorias:</strong> {nutrition.calories}</div>
      <div><strong>Proteína:</strong> {nutrition.protein}</div>
      <div><strong>Gorduras:</strong> {nutrition.fats}</div>
      <div><strong>Carboidratos:</strong> {nutrition.carbs}</div>
    </div>
  );
};
