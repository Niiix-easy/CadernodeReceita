import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const PasswordStrengthIndicator = ({ password }) => {
    const calculateStrength = (p) => {
        let score = 0;
        if (!p)
            return 0;
        if (p.length >= 8)
            score += 25;
        if (/[A-Z]/.test(p))
            score += 25;
        if (/[0-9]/.test(p))
            score += 25;
        if (/[^A-Za-z0-9]/.test(p))
            score += 25;
        return score;
    };
    const strength = calculateStrength(password);
    const getLabel = (s) => {
        if (s === 0)
            return '';
        if (s <= 25)
            return 'Fraca';
        if (s <= 50)
            return 'Média';
        if (s <= 75)
            return 'Boa';
        return 'Forte';
    };
    const getColor = (s) => {
        if (s <= 25)
            return 'bg-red-500';
        if (s <= 50)
            return 'bg-amber-500';
        if (s <= 75)
            return 'bg-blue-500';
        return 'bg-emerald-500';
    };
    return (_jsxs("div", { className: "space-y-1 mt-1", children: [_jsxs("div", { className: "flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider", children: [_jsx("span", { children: "For\u00E7a da Senha" }), _jsx("span", { children: getLabel(strength) })] }), _jsx("div", { className: "h-1 w-full bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full transition-all duration-300 ${getColor(strength)}`, style: { width: `${strength}%` } }) })] }));
};
