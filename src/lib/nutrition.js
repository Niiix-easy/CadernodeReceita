const INGREDIENTS_DB = {
    'farinha': { cals: 364, prot: 10, fat: 1, carb: 76 },
    'açúcar': { cals: 387, prot: 0, fat: 0, carb: 100 },
    'ovo': { cals: 155, prot: 13, fat: 11, carb: 1 },
    'leite': { cals: 42, prot: 3, fat: 1, carb: 5 },
    'manteiga': { cals: 717, prot: 1, fat: 81, carb: 0 },
};
export const estimateNutrition = (ingredients) => {
    let totals = { cals: 0, prot: 0, fat: 0, carb: 0 };
    ingredients.forEach(ing => {
        const lower = ing.toLowerCase();
        for (const [key, values] of Object.entries(INGREDIENTS_DB)) {
            if (lower.includes(key)) {
                totals.cals += values.cals;
                totals.prot += values.prot;
                totals.fat += values.fat;
                totals.carb += values.carb;
                break;
            }
        }
    });
    return totals;
};
