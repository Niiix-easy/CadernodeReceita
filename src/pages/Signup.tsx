import { useState, type FormEvent } from "react";
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
  const [errs, setErrs] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormErr(null);
    const next = {
      email: isEmail(email) ? undefined : "Digite um e-mail válido.",
      password: password.length >= 8 ? undefined : "A senha precisa ter pelo menos 8 caracteres.",
      confirm: confirm === password ? undefined : "As senhas não são iguais.",
    };
    setErrs(next);
    if (next.email || next.password || next.confirm) return;
    setBusy(true);
    const r = await signUp(email, password);
    setBusy(false);
    if (r.error) setFormErr(authMessage(r.error));
    else if (r.needsConfirmation) setDone(true);
    else nav("/", { replace: true });
  }

  if (done) {
    return (
      <AuthShell title="Confira seu e-mail">
        <p className="text-center text-sm">
          Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar, é só entrar.
        </p>
        <Link to="/entrar" className="btn-primary mt-4 w-full">Ir para o login</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Criar conta" subtitle="Comece grátis e assine o Premium quando quiser">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
          <input id="email" type="email" autoComplete="email" inputMode="email" className="input" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setErrs((p) => ({ ...p, email: email && !isEmail(email) ? "Digite um e-mail válido." : undefined }))}
            aria-invalid={errs.email ? true : undefined} aria-describedby={errs.email ? "email-err" : undefined}
            placeholder="voce@exemplo.com" />
          {errs.email && <p id="email-err" role="alert" className="mt-1 text-sm text-red-700">{errs.email}</p>}
        </div>
        <PasswordInput label="Senha (mínimo 8 caracteres)" autoComplete="new-password" value={password}
          onChange={(e) => { setPassword(e.target.value); setErrs((p) => ({ ...p, password: undefined })); }} error={errs.password} />
        <PasswordStrengthIndicator password={password} />
        <PasswordInput label="Confirmar senha" autoComplete="new-password" value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setErrs((p) => ({ ...p, confirm: undefined })); }} error={errs.confirm} />
        {formErr && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{formErr}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Criando…" : "Criar conta"}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Já tem conta? <Link to="/entrar" className="font-semibold text-terracotta-dark underline">Entrar</Link>
      </p>
      <div className="mt-4 flex flex-col items-center gap-2">
        <button className="btn-secondary w-full" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}>Criar conta com Google</button>
        <button className="btn-secondary w-full" onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}>Criar conta com GitHub</button>
      </div>
    </AuthShell>
  );
}
