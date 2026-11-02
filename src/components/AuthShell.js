import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BookOpen } from "lucide-react";
export function AuthShell({ title, subtitle, children }) {
    return (_jsx("div", { className: "flex min-h-screen items-center justify-center px-4 py-8", children: _jsxs("div", { className: "w-full max-w-sm", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx(BookOpen, { className: "mx-auto mb-2 text-terracotta", size: 36, "aria-hidden": true }), _jsx("h1", { className: "text-2xl font-bold text-terracotta-dark", children: title }), subtitle && _jsx("p", { className: "mt-1 text-sm text-muted", children: subtitle })] }), _jsx("div", { className: "card", children: children })] }) }));
}
