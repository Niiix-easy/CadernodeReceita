import { jsx as _jsx } from "react/jsx-runtime";
const SUBSTITUTIONS = {
    "manteiga": "pode substituir por óleo vegetal ou iogurte",
    "ovo": "pode substituir por farinha de linhaça com água",
    "leite": "pode substituir por leite vegetal (amêndoas, aveia)",
    "açúcar": "pode substituir por mel ou adoçante culinário",
    "farinha": "pode substituir por farinha de aveia ou amêndoas"
};
export const QuickTips = ({ ingredient }) => {
    if (!ingredient || ingredient.length < 3)
        return null;
    const tips = Object.entries(SUBSTITUTIONS)
        .filter(([key]) => ingredient.toLowerCase().includes(key))
        .map(([key, tip]) => `${key}: ${tip}`);
    if (tips.length === 0)
        return null;
    return (_jsx("div", { className: "text-xs text-terracotta-dark bg-sand p-2 rounded mt-1", children: tips.map((t, i) => _jsx("p", { children: t }, i)) }));
};
