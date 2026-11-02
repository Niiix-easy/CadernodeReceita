export const validateRecipe = (title, ingredients, steps) => {
    const errors = [];
    if (title.length < 5)
        errors.push('O título precisa ter pelo menos 5 caracteres.');
    if (ingredients.length < 2 || ingredients.some(i => i.trim().length < 3))
        errors.push('Adicione pelo menos 2 ingredientes válidos.');
    if (steps.length < 2 || steps.some(s => s.trim().length < 5))
        errors.push('Adicione pelo menos 2 passos de preparo detalhados.');
    return errors;
};
