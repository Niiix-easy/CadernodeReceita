import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";
import { authMessage } from "@/lib/errors";
/** Aberta pelo link do e-mail de recuperação (o Supabase cria a sessão automaticamente). */
export default function ResetPassword() {
    const { user, loading, updatePassword } = useAuth();
    const nav = useNavigate();
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errs, setErrs] = useState({});
    const [formErr, setFormErr] = useState(null);
    const [busy, setBusy] = useState(false);
    if (loading)
        return _jsx(Spinner, {});
    if (!user) {
        return (_jsxs(AuthShell, { title: "Link inv\u00E1lido ou expirado", children: [_jsx("p", { className: "text-center text-sm", children: "Pe\u00E7a um novo link de recupera\u00E7\u00E3o." }), _jsx(Link, { to: "/esqueci-senha", className: "btn-primary mt-4 w-full", children: "Pedir novo link" })] }));
    }
    async function onSubmit(e) {
        e.preventDefault();
        const next = {
            password: password.length >= 8 ? undefined : "A senha precisa ter pelo menos 8 caracteres.",
            confirm: confirm === password ? undefined : "As senhas não são iguais.",
        };
        setErrs(next);
        if (next.password || next.confirm)
            return;
        setBusy(true);
        const err = await updatePassword(password);
        setBusy(false);
        if (err)
            setFormErr(authMessage(err));
        else
            nav("/", { replace: true });
    }
    return (_jsx(AuthShell, { title: "Nova senha", children: _jsxs("form", { onSubmit: onSubmit, noValidate: true, className: "space-y-4", children: [_jsx(PasswordInput, { label: "Nova senha (m\u00EDnimo 8 caracteres)", autoComplete: "new-password", value: password, onChange: (e) => setPassword(e.target.value), error: errs.password }), _jsx(PasswordInput, { label: "Confirmar nova senha", autoComplete: "new-password", value: confirm, onChange: (e) => setConfirm(e.target.value), error: errs.confirm }), formErr && _jsx("p", { role: "alert", className: "text-sm text-red-700", children: formErr }), _jsx("button", { type: "submit", className: "btn-primary w-full", disabled: busy, children: busy ? "Salvando…" : "Salvar nova senha" })] }) }));
}
