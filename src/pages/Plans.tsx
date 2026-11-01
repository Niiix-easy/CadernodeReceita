import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "@/components/Spinner";

const PRICE = import.meta.env.VITE_PRICE_DISPLAY ?? "R$ 19,90";

const FREE = [
  { t: "Catálogo com 30 itens", ok: true },
  { t: "Receitas, ingredientes e passos", ok: false },
  { t: "Vídeos e links das fontes", ok: false },
  { t: "Favoritos", ok: false },
];
const PREMIUM = FREE.map((f) => ({ ...f, ok: true }));

export default function Plans() {
  const { isPremium, loading } = useSubscription();
  const loc = useLocation();
  const message = (loc.state as { message?: string } | null)?.message;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setBusy(true); setError(null);
    const { data, error: e } = await supabase.functions.invoke<{ init_point?: string; error?: string }>("create-subscription");
    if (e || !data?.init_point) {
      let msg = data?.error;
      if (!msg && e && "context" in e) {
        try { msg = (await (e as unknown as { context: Response }).context.json()).error; } catch { /* ignora */ }
      }
      setError(msg ?? "Não foi possível iniciar a assinatura. Tente novamente.");
      setBusy(false);
      return;
    }
    window.location.href = data.init_point;
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Planos</h1>
        <p className="mt-1 text-muted">Cancele quando quiser. Cobrança mensal recorrente no cartão pelo Mercado Pago.</p>
      </header>
      {message && <p role="status" className="rounded-lg border border-terracotta/30 bg-sand p-3 text-center text-sm">{message}</p>}
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-800">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card" aria-labelledby="p-free">
          <h2 id="p-free" className="text-xl font-bold">Grátis</h2>
          <p className="my-2 text-3xl font-bold">R$ 0</p>
          <ul className="space-y-2 text-sm">
            {FREE.map((f) => (
              <li key={f.t} className={`flex items-center gap-2 ${f.ok ? "" : "text-muted"}`}>
                {f.ok ? <Check size={16} className="text-green-700" aria-label="Incluído" /> : <X size={16} aria-label="Não incluído" />} {f.t}
              </li>
            ))}
          </ul>
        </section>

        <section className="card border-2 border-terracotta" aria-labelledby="p-prem">
          <h2 id="p-prem" className="text-xl font-bold text-terracotta-dark">Premium</h2>
          <p className="my-2 text-3xl font-bold">{PRICE}<span className="text-base font-normal text-muted"> /mês</span></p>
          <ul className="space-y-2 text-sm">
            {PREMIUM.map((f) => (
              <li key={f.t} className="flex items-center gap-2"><Check size={16} className="text-green-700" aria-label="Incluído" /> {f.t}</li>
            ))}
          </ul>
          {isPremium ? (
            <Link to="/assinatura" className="btn-secondary mt-4 w-full">Gerenciar assinatura</Link>
          ) : (
            <button className="btn-primary mt-4 w-full" onClick={subscribe} disabled={busy}>
              {busy ? "Abrindo o Mercado Pago…" : "Assinar Premium"}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
