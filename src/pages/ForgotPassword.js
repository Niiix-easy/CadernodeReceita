import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { authMessage, isEmail } from "@/lib/errors";
export default function ForgotPassword() {
    const { sendReset } = useAuth();
    const [email, setEmail] = useState("");
    const [err, setErr] = useState(null);
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        if (!isEmail(email)) {
            setErr("Digite um e-mail válido.");
            return;
        }
        setBusy(true);
        setErr(null);
        const error = await sendReset(email);
        setBusy(false);
        if (error)
            setErr(authMessage(error));
        else
            setSent(true);
    }
    return (_jsxs(AuthShell, { title: "Recuperar senha", subtitle: "Enviaremos um link para criar uma nova senha", children: [sent ? (_jsx("p", { className: "text-center text-sm", children: "Se o e-mail estiver cadastrado, o link chegar\u00E1 em instantes. Confira tamb\u00E9m o spam." })) : (_jsxs("form", { onSubmit: onSubmit, noValidate: true, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "mb-1 block text-sm font-medium", children: "E-mail" }), _jsx("input", { id: "email", type: "email", autoComplete: "email", className: "input", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "voce@exemplo.com" })] }), err && _jsx("p", { role: "alert", className: "text-sm text-red-700", children: err }), _jsx("button", { type: "submit", className: "btn-primary w-full", disabled: busy, children: busy ? "Enviando…" : "Enviar link" })] })), _jsx("p", { className: "mt-4 text-center text-sm", children: _jsx(Link, { to: "/entrar", className: "text-terracotta-dark underline", children: "Voltar ao login" }) })] }));
}
