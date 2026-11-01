import React from 'react';

export const RecipeSubmissionValidator: React.FC<{ errors: string[] }> = ({ errors }) => {
  if (errors.length === 0) return null;
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm space-y-1">
      <p className="font-bold">Erros no formulário:</p>
      <ul className="list-disc pl-4">
        {errors.map((error, i) => <li key={i}>{error}</li>)}
      </ul>
    </div>
  );
};
