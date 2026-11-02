import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AuthShell } from "@/components/AuthShell";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/context/AuthContext";
import { authMessage, isEmail } from "@/lib/errors";
export default function Login() {
    const { signIn } = useAuth();
    const nav = useNavigate();
    const loc = useLocation();
    const from = loc.state?.from ?? "/";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailErr, setEmailErr] = useState(null);
    const [passErr, setPassErr] = useState(null);
    const [formErr, setFormErr] = useState(null);
    const [busy, setBusy] = useState(false);
    async function onSubmit(e) {
        e.preventDefault();
        setFormErr(null);
        const eErr = isEmail(email) ? null : "Digite um e-mail válido.";
        const pErr = password ? null : "Digite sua senha.";
        setEmailErr(eErr);
        setPassErr(pErr);
        if (eErr || pErr)
            return;
        setBusy(true);
        const err = await signIn(email, password);
        setBusy(false);
        if (err)
            setFormErr(authMessage(err));
        else
            nav(from, { replace: true });
    }
    return (_jsxs(AuthShell, { title: "Entrar", subtitle: "Acesse seu Caderno de Receitas", children: [_jsxs("form", { onSubmit: onSubmit, noValidate: true, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "mb-1 block text-sm font-medium", children: "E-mail" }), _jsx("input", { id: "email", type: "email", autoComplete: "email", inputMode: "email", className: "input", value: email, onChange: (e) => setEmail(e.target.value), onBlur: () => setEmailErr(email && !isEmail(email) ? "Digite um e-mail válido." : null), "aria-invalid": emailErr ? true : undefined, "aria-describedby": emailErr ? "email-err" : undefined, placeholder: "voce@exemplo.com" }), emailErr && _jsx("p", { id: "email-err", role: "alert", className: "mt-1 text-sm text-red-700", children: emailErr })] }), _jsx(PasswordInput, { label: "Senha", autoComplete: "current-password", value: password, onChange: (e) => { setPassword(e.target.value); setPassErr(null); }, error: passErr }), formErr && _jsx("p", { role: "alert", className: "rounded-lg bg-red-50 p-3 text-sm text-red-800", children: formErr }), _jsx("button", { type: "submit", className: "btn-primary w-full", disabled: busy, children: busy ? "Entrando…" : "Entrar" })] }), _jsxs("div", { className: "mt-4 flex flex-col items-center gap-1 text-sm", children: [_jsx("button", { className: "btn-secondary w-full", onClick: () => supabase.auth.signInWithOAuth({ provider: 'google' }), children: "Entrar com Google" }), _jsx("button", { className: "btn-secondary w-full", onClick: () => supabase.auth.signInWithOAuth({ provider: 'github' }), children: "Entrar com GitHub" }), _jsx(Link, { to: "/esqueci-senha", className: "text-terracotta-dark underline", children: "Esqueci minha senha" }), _jsxs("span", { className: "text-muted", children: ["N\u00E3o tem conta? ", _jsx(Link, { to: "/cadastrar", className: "font-semibold text-terracotta-dark underline", children: "Criar conta" })] })] })] }));
}
