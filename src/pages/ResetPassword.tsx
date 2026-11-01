import { useState, type FormEvent } from "react";
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
  const [errs, setErrs] = useState<{ password?: string; confirm?: string }>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner />;
  if (!user) {
    return (
      <AuthShell title="Link inválido ou expirado">
        <p className="text-center text-sm">Peça um novo link de recuperação.</p>
        <Link to="/esqueci-senha" className="btn-primary mt-4 w-full">Pedir novo link</Link>
      </AuthShell>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = {
      password: password.length >= 8 ? undefined : "A senha precisa ter pelo menos 8 caracteres.",
      confirm: confirm === password ? undefined : "As senhas não são iguais.",
    };
    setErrs(next);
    if (next.password || next.confirm) return;
    setBusy(true);
    const err = await updatePassword(password);
    setBusy(false);
    if (err) setFormErr(authMessage(err)); else nav("/", { replace: true });
  }

  return (
    <AuthShell title="Nova senha">
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <PasswordInput label="Nova senha (mínimo 8 caracteres)" autoComplete="new-password" value={password}
          onChange={(e) => setPassword(e.target.value)} error={errs.password} />
        <PasswordInput label="Confirmar nova senha" autoComplete="new-password" value={confirm}
          onChange={(e) => setConfirm(e.target.value)} error={errs.confirm} />
        {formErr && <p role="alert" className="text-sm text-red-700">{formErr}</p>}
        <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Salvando…" : "Salvar nova senha"}</button>
      </form>
    </AuthShell>
  );
}
