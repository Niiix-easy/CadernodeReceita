import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";
import { authMessage, isEmail } from "@/lib/errors";

export default function ForgotPassword() {
  const { sendReset } = useAuth();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) { setErr("Digite um e-mail válido."); return; }
    setBusy(true); setErr(null);
    const error = await sendReset(email);
    setBusy(false);
    if (error) setErr(authMessage(error)); else setSent(true);
  }

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para criar uma nova senha">
      {sent ? (
        <p className="text-center text-sm">Se o e-mail estiver cadastrado, o link chegará em instantes. Confira também o spam.</p>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">E-mail</label>
            <input id="email" type="email" autoComplete="email" className="input" value={email}
              onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </div>
          {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
          <button type="submit" className="btn-primary w-full" disabled={busy}>{busy ? "Enviando…" : "Enviar link"}</button>
        </form>
      )}
      <p className="mt-4 text-center text-sm"><Link to="/entrar" className="text-terracotta-dark underline">Voltar ao login</Link></p>
    </AuthShell>
  );
}
