export const parseIngredients = (rawText: string) => {
  const lines = rawText.split('\n');
  return lines
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^\d+\s*/, '').trim()); // Remove leading numbers
};
