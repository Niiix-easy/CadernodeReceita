import { jsx as _jsx } from "react/jsx-runtime";
export const CategorySelector = ({ selected, onSelect, categories }) => {
    return (_jsx("div", { role: "tablist", "aria-label": "Categorias", className: "flex flex-wrap gap-2", children: categories.map((c) => (_jsx("button", { role: "tab", "aria-selected": selected.includes(c), onClick: () => {
                if (selected.includes(c)) {
                    onSelect(selected.filter(s => s !== c));
                }
                else {
                    onSelect([...selected, c]);
                }
            }, className: `btn ${selected.includes(c) ? "bg-terracotta text-white" : "border border-ink/15 bg-white hover:bg-sand"}`, children: c }, c))) }));
};
