import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "@/components/Spinner";
const LABEL = {
    none: "Sem assinatura",
    pending: "Pagamento pendente",
    authorized: "Ativa",
    paused: "Pausada",
    cancelled: "Cancelada",
};
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString("pt-BR") : "—");
export default function Subscription() {
    const { subscription, isPremium, loading, refresh, sync } = useSubscription();
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [msg, setMsg] = useState(null);
    if (loading)
        return _jsx(Spinner, {});
    const status = subscription?.status ?? "none";
    async function update() {
        setBusy(true);
        setMsg(null);
        const err = await sync();
        setBusy(false);
        setMsg(err ? { ok: false, text: err } : { ok: true, text: "Status atualizado." });
    }
    async function cancel() {
        setBusy(true);
        setMsg(null);
        const { error } = await supabase.functions.invoke("cancel-subscription");
        setBusy(false);
        setConfirming(false);
        if (error) {
            setMsg({ ok: false, text: "Não foi possível cancelar agora. Tente novamente." });
            return;
        }
        await refresh();
        setMsg({ ok: true, text: "Assinatura cancelada. Você mantém o acesso até a data indicada abaixo." });
    }
    return (_jsxs("div", { className: "mx-auto max-w-xl space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Minha assinatura" }), _jsxs("section", { className: "card space-y-3", "aria-live": "polite", children: [_jsxs("dl", { className: "grid grid-cols-2 gap-y-2 text-sm", children: [_jsx("dt", { className: "text-muted", children: "Plano" }), _jsx("dd", { className: "font-medium", children: isPremium ? "Premium" : "Grátis" }), _jsx("dt", { className: "text-muted", children: "Status" }), _jsx("dd", { className: "font-medium", children: LABEL[status] }), _jsx("dt", { className: "text-muted", children: "Pr\u00F3xima cobran\u00E7a" }), _jsx("dd", { children: status === "authorized" ? fmt(subscription?.next_payment_date ?? null) : "—" }), _jsx("dt", { className: "text-muted", children: "Acesso at\u00E9" }), _jsx("dd", { children: fmt(subscription?.access_until ?? null) })] }), msg && _jsx("p", { role: msg.ok ? "status" : "alert", className: `rounded-lg p-3 text-sm ${msg.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-800"}`, children: msg.text }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [!isPremium && status !== "authorized" && _jsx(Link, { to: "/planos", className: "btn-primary", children: "Assinar Premium" }), (status === "pending" || status === "authorized" || status === "paused") && (_jsx("button", { className: "btn-secondary", onClick: update, disabled: busy, children: busy ? "Atualizando…" : "Atualizar status" })), status === "authorized" && !confirming && (_jsx("button", { className: "btn-secondary", onClick: () => setConfirming(true), disabled: busy, children: "Cancelar assinatura" }))] }), confirming && (_jsxs("div", { role: "alertdialog", "aria-label": "Confirmar cancelamento", className: "rounded-xl border border-red-300 bg-red-50 p-3", children: [_jsxs("p", { className: "text-sm", children: ["Cancelar a assinatura Premium? N\u00E3o haver\u00E1 novas cobran\u00E7as e voc\u00EA mant\u00E9m o acesso at\u00E9 ", fmt(subscription?.next_payment_date ?? subscription?.access_until ?? null), "."] }), _jsxs("div", { className: "mt-3 flex gap-2", children: [_jsx("button", { className: "btn-danger", onClick: cancel, disabled: busy, children: busy ? "Cancelando…" : "Cancelar assinatura Premium" }), _jsx("button", { className: "btn-secondary", onClick: () => setConfirming(false), disabled: busy, children: "Manter assinatura" })] })] }))] })] }));
}
