import { jsx as _jsx } from "react/jsx-runtime";
export const TagLabel = ({ label }) => {
    const getTagStyles = (label) => {
        switch (label.toLowerCase()) {
            case 'vegan': return 'bg-[var(--tag-vegan)] text-white';
            case 'dessert': return 'bg-[var(--tag-dessert)] text-white';
            case 'quick': return 'bg-[var(--tag-quick)] text-white';
            default: return 'bg-sand text-ink';
        }
    };
    return (_jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-semibold ${getTagStyles(label)}`, children: label }));
};
