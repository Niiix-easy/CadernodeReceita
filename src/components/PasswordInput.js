import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
/** Campo de senha com botão de olho para mostrar/ocultar. */
export function PasswordInput({ label, error, className = "", ...rest }) {
    const [visible, setVisible] = useState(false);
    const id = useId();
    const errId = `${id}-err`;
    return (_jsxs("div", { children: [_jsx("label", { htmlFor: id, className: "mb-1 block text-sm font-medium", children: label }), _jsxs("div", { className: "relative", children: [_jsx("input", { ...rest, id: id, type: visible ? "text" : "password", "aria-invalid": error ? true : undefined, "aria-describedby": error ? errId : undefined, className: `input pr-12 ${className}` }), _jsx("button", { type: "button", onClick: () => setVisible((v) => !v), "aria-label": visible ? "Ocultar senha" : "Mostrar senha", "aria-pressed": visible, className: "absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-sand", children: visible ? _jsx(EyeOff, { size: 20, "aria-hidden": true }) : _jsx(Eye, { size: 20, "aria-hidden": true }) })] }), error && _jsx("p", { id: errId, role: "alert", className: "mt-1 text-sm text-red-700", children: error })] }));
}
