import { jsx as _jsx } from "react/jsx-runtime";
export const DifficultyBadge = ({ level }) => {
    if (!level)
        return null;
    const getBadgeStyles = (level) => {
        switch (level) {
            case 'Fácil': return 'bg-[var(--diff-easy)]';
            case 'Médio': return 'bg-[var(--diff-medium)]';
            case 'Difícil': return 'bg-[var(--diff-hard)]';
            default: return 'bg-gray-500';
        }
    };
    return (_jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full text-white font-semibold ${getBadgeStyles(level)}`, children: level }));
};
