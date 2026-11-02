import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { useAuth } from "@/context/AuthContext";
import { authMessage, isEmail } from "@/lib/errors";
export default function Signup() {
    const { signUp } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errs, setErrs] = useState({});
    const [formErr, setFormErr] = useState(null);
    const [done, setDone] = useState(false);
    const [busy, setBusy] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setFormErr(null);
        const next = {
            email: isEmail(email) ? undefined : "Digite um e-mail válido.",
            password: password.length >= 8 ? undefined : "A senha precisa ter pelo menos 8 caracteres.",
            confirm: confirm === password ? undefined : "As senhas não são iguais.",
        };
        setErrs(next);
        if (next.email || next.password || next.confirm)
            return;
        setBusy(true);
        const r = await signUp(email, password);
        setBusy(false);
        if (r.error)
            setFormErr(authMessage(r.error));
        else if (r.needsConfirmation)
            setDone(true);
        else
            nav("/", { replace: true });
    }
    if (done) {
        return (_jsxs(AuthShell, { title: "Confira seu e-mail", children: [_jsxs("p", { className: "text-center text-sm", children: ["Enviamos um link de confirma\u00E7\u00E3o para ", _jsx("strong", { children: email }), ". Depois de confirmar, \u00E9 s\u00F3 entrar."] }), _jsx(Link, { to: "/entrar", className: "btn-primary mt-4 w-full", children: "Ir para o login" })] }));
    }
    return (_jsxs(AuthShell, { title: "Criar conta", subtitle: "Comece gr\u00E1tis e assine o Premium quando quiser", children: [_jsxs("form", { onSubmit: onSubmit, noValidate: true, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "mb-1 block text-sm font-medium", children: "E-mail" }), _jsx("input", { id: "email", type: "email", autoComplete: "email", inputMode: "email", className: "input", value: email, onChange: (e) => setEmail(e.target.value), onBlur: () => setErrs((p) => ({ ...p, email: email && !isEmail(email) ? "Digite um e-mail válido." : undefined })), "aria-invalid": errs.email ? true : undefined, "aria-describedby": errs.email ? "email-err" : undefined, placeholder: "voce@exemplo.com" }), errs.email && _jsx("p", { id: "email-err", role: "alert", className: "mt-1 text-sm text-red-700", children: errs.email })] }), _jsx(PasswordInput, { label: "Senha (m\u00EDnimo 8 caracteres)", autoComplete: "new-password", value: password, onChange: (e) => { setPassword(e.target.value); setErrs((p) => ({ ...p, password: undefined })); }, error: errs.password }), _jsx(PasswordStrengthIndicator, { password: password }), _jsx(PasswordInput, { label: "Confirmar senha", autoComplete: "new-password", value: confirm, onChange: (e) => { setConfirm(e.target.value); setErrs((p) => ({ ...p, confirm: undefined })); }, error: errs.confirm }), formErr && _jsx("p", { role: "alert", className: "rounded-lg bg-red-50 p-3 text-sm text-red-800", children: formErr }), _jsx("button", { type: "submit", className: "btn-primary w-full", disabled: busy, children: busy ? "Criando…" : "Criar conta" })] }), _jsxs("p", { className: "mt-4 text-center text-sm text-muted", children: ["J\u00E1 tem conta? ", _jsx(Link, { to: "/entrar", className: "font-semibold text-terracotta-dark underline", children: "Entrar" })] }), _jsxs("div", { className: "mt-4 flex flex-col items-center gap-2", children: [_jsx("button", { className: "btn-secondary w-full", onClick: () => supabase.auth.signInWithOAuth({ provider: 'google' }), children: "Criar conta com Google" }), _jsx("button", { className: "btn-secondary w-full", onClick: () => supabase.auth.signInWithOAuth({ provider: 'github' }), children: "Criar conta com GitHub" })] })] }));
}
