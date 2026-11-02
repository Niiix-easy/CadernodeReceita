import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Spinner({ label = "Carregando…" }) {
    return (_jsxs("div", { role: "status", className: "flex items-center justify-center gap-2 py-16 text-muted", children: [_jsx("span", { className: "h-5 w-5 animate-spin rounded-full border-2 border-terracotta border-t-transparent", "aria-hidden": true }), _jsx("span", { children: label })] }));
}
