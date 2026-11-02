import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const NutritionFacts = ({ nutrition }) => {
    if (!nutrition)
        return null;
    return (_jsxs("div", { className: "grid grid-cols-4 gap-2 text-xs bg-sand p-2 rounded", children: [_jsxs("div", { children: [_jsx("strong", { children: "Calorias:" }), " ", nutrition.calories] }), _jsxs("div", { children: [_jsx("strong", { children: "Prote\u00EDna:" }), " ", nutrition.protein] }), _jsxs("div", { children: [_jsx("strong", { children: "Gorduras:" }), " ", nutrition.fats] }), _jsxs("div", { children: [_jsx("strong", { children: "Carboidratos:" }), " ", nutrition.carbs] })] }));
};
