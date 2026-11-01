import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "@/components/Spinner";
import type { SubStatus } from "@/lib/types";

const LABEL: Record<SubStatus, string> = {
  none: "Sem assinatura",
  pending: "Pagamento pendente",
  authorized: "Ativa",
  paused: "Pausada",
  cancelled: "Cancelada",
};

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");

export default function Subscription() {
  const { subscription, isPremium, loading, refresh, sync } = useSubscription();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (loading) return <Spinner />;
  const status: SubStatus = subscription?.status ?? "none";

  async function update() {
    setBusy(true); setMsg(null);
    const err = await sync();
    setBusy(false);
    setMsg(err ? { ok: false, text: err } : { ok: true, text: "Status atualizado." });
  }

  async function cancel() {
    setBusy(true); setMsg(null);
    const { error } = await supabase.functions.invoke("cancel-subscription");
    setBusy(false); setConfirming(false);
    if (error) { setMsg({ ok: false, text: "Não foi possível cancelar agora. Tente novamente." }); return; }
    await refresh();
    setMsg({ ok: true, text: "Assinatura cancelada. Você mantém o acesso até a data indicada abaixo." });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Minha assinatura</h1>
      <section className="card space-y-3" aria-live="polite">
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted">Plano</dt><dd className="font-medium">{isPremium ? "Premium" : "Grátis"}</dd>
          <dt className="text-muted">Status</dt><dd className="font-medium">{LABEL[status]}</dd>
          <dt className="text-muted">Próxima cobrança</dt><dd>{status === "authorized" ? fmt(subscription?.next_payment_date ?? null) : "—"}</dd>
          <dt className="text-muted">Acesso até</dt><dd>{fmt(subscription?.access_until ?? null)}</dd>
        </dl>
        {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-800"}`}>{msg.text}</p>}

        <div className="flex flex-wrap gap-2">
          {!isPremium && status !== "authorized" && <Link to="/planos" className="btn-primary">Assinar Premium</Link>}
          {(status === "pending" || status === "authorized" || status === "paused") && (
            <button className="btn-secondary" onClick={update} disabled={busy}>{busy ? "Atualizando…" : "Atualizar status"}</button>
          )}
          {status === "authorized" && !confirming && (
            <button className="btn-secondary" onClick={() => setConfirming(true)} disabled={busy}>Cancelar assinatura</button>
          )}
        </div>

        {confirming && (
          <div role="alertdialog" aria-label="Confirmar cancelamento" className="rounded-xl border border-red-300 bg-red-50 p-3">
            <p className="text-sm">Cancelar a assinatura Premium? Não haverá novas cobranças e você mantém o acesso até {fmt(subscription?.next_payment_date ?? subscription?.access_until ?? null)}.</p>
            <div className="mt-3 flex gap-2">
              <button className="btn-danger" onClick={cancel} disabled={busy}>{busy ? "Cancelando…" : "Cancelar assinatura Premium"}</button>
              <button className="btn-secondary" onClick={() => setConfirming(false)} disabled={busy}>Manter assinatura</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
