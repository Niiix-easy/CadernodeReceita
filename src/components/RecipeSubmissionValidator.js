import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const RecipeSubmissionValidator = ({ errors }) => {
    if (errors.length === 0)
        return null;
    return (_jsxs("div", { className: "bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm space-y-1", children: [_jsx("p", { className: "font-bold", children: "Erros no formul\u00E1rio:" }), _jsx("ul", { className: "list-disc pl-4", children: errors.map((error, i) => _jsx("li", { children: error }, i)) })] }));
};
