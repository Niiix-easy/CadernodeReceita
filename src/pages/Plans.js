import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const message = loc.state?.message;
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    async function subscribe() {
        setBusy(true);
        setError(null);
        const { data, error: e } = await supabase.functions.invoke("create-subscription");
        if (e || !data?.init_point) {
            let msg = data?.error;
            if (!msg && e && "context" in e) {
                try {
                    msg = (await e.context.json()).error;
                }
                catch { /* ignora */ }
            }
            setError(msg ?? "Não foi possível iniciar a assinatura. Tente novamente.");
            setBusy(false);
            return;
        }
        window.location.href = data.init_point;
    }
    if (loading)
        return _jsx(Spinner, {});
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("header", { className: "text-center", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Planos" }), _jsx("p", { className: "mt-1 text-muted", children: "Cancele quando quiser. Cobran\u00E7a mensal recorrente no cart\u00E3o pelo Mercado Pago." })] }), message && _jsx("p", { role: "status", className: "rounded-lg border border-terracotta/30 bg-sand p-3 text-center text-sm", children: message }), error && _jsx("p", { role: "alert", className: "rounded-lg bg-red-50 p-3 text-center text-sm text-red-800", children: error }), _jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("section", { className: "card", "aria-labelledby": "p-free", children: [_jsx("h2", { id: "p-free", className: "text-xl font-bold", children: "Gr\u00E1tis" }), _jsx("p", { className: "my-2 text-3xl font-bold", children: "R$ 0" }), _jsx("ul", { className: "space-y-2 text-sm", children: FREE.map((f) => (_jsxs("li", { className: `flex items-center gap-2 ${f.ok ? "" : "text-muted"}`, children: [f.ok ? _jsx(Check, { size: 16, className: "text-green-700", "aria-label": "Inclu\u00EDdo" }) : _jsx(X, { size: 16, "aria-label": "N\u00E3o inclu\u00EDdo" }), " ", f.t] }, f.t))) })] }), _jsxs("section", { className: "card border-2 border-terracotta", "aria-labelledby": "p-prem", children: [_jsx("h2", { id: "p-prem", className: "text-xl font-bold text-terracotta-dark", children: "Premium" }), _jsxs("p", { className: "my-2 text-3xl font-bold", children: [PRICE, _jsx("span", { className: "text-base font-normal text-muted", children: " /m\u00EAs" })] }), _jsx("ul", { className: "space-y-2 text-sm", children: PREMIUM.map((f) => (_jsxs("li", { className: "flex items-center gap-2", children: [_jsx(Check, { size: 16, className: "text-green-700", "aria-label": "Inclu\u00EDdo" }), " ", f.t] }, f.t))) }), isPremium ? (_jsx(Link, { to: "/assinatura", className: "btn-secondary mt-4 w-full", children: "Gerenciar assinatura" })) : (_jsx("button", { className: "btn-primary mt-4 w-full", onClick: subscribe, disabled: busy, children: busy ? "Abrindo o Mercado Pago…" : "Assinar Premium" }))] })] })] }));
}
