import { useState, type FormEvent } from "react";
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
  const from = (loc.state as { from?: string } | null)?.from ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const eErr = isEmail(email) ? null : "Digite um e-mail válido.";
    const pErr = password ? null : "Digite sua senha.";
    setEmailErr(eErr); setPassErr(pErr);
    if (eErr || pErr) return;
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) setFormErr(authMessage(err));
    else nav(from, { replace: true });
  }

  return (
    <AuthShell title="Entrar" subtitle="Acesse seu Caderno de Receitas">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
          <input id="email" type="email" autoComplete="email" inputMode="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailErr(email && !isEmail(email) ? "Digite um e-mail válido." : null)}
            aria-invalid={emailErr ? true : undefined} aria-describedby={emailErr ? "email-err" : undefined}
            placeholder="voce@exemplo.com" />
          {emailErr && <p id="email-err" role="alert" className="mt-1 text-sm text-red-700">{emailErr}</p>}
        </div>
        <PasswordInput label="Senha" autoComplete="current-password" value={password}
          onChange={(e) => { setPassword(e.target.value); setPassErr(null); }} error={passErr} />
        {formErr && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{formErr}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Entrando…" : "Entrar"}</button>
      </form>
      <div className="mt-4 flex flex-col items-center gap-1 text-sm">
        <button className="btn-secondary w-full" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>Entrar com Google</button>
        <button className="btn-secondary w-full" onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}>Entrar com GitHub</button>
        <Link to="/esqueci-senha" className="text-terracotta-dark underline">Esqueci minha senha</Link>
        <span className="text-muted">Não tem conta? <Link to="/cadastrar" className="font-semibold text-terracotta-dark underline">Criar conta</Link></span>
      </div>
    </AuthShell>
  );
}
