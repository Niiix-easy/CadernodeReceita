import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, Clock, CircleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "@/components/Spinner";
/** Para onde o Mercado Pago devolve o cliente depois do pagamento. */
export default function SubscriptionReturn() {
    const { refresh } = useSubscription();
    const [result, setResult] = useState("checking");
    const ran = useRef(false);
    async function check() {
        setResult("checking");
        const { data, error } = await supabase.functions.invoke("sync-subscription");
        await refresh();
        if (error)
            setResult("failed");
        else if (data?.status === "authorized")
            setResult("authorized");
        else if (data?.status === "pending" || data?.status === "paused")
            setResult("pending");
        else
            setResult("failed");
    }
    useEffect(() => {
        if (ran.current)
            return;
        ran.current = true;
        void check();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    if (result === "checking")
        return _jsx(Spinner, { label: "Confirmando seu pagamento\u2026" });
    const view = {
        authorized: { Icon: CircleCheck, color: "text-green-700", title: "Assinatura ativa!", text: "Obrigado! Todo o conteúdo Premium já está liberado." },
        pending: { Icon: Clock, color: "text-amber-700", title: "Pagamento em análise", text: "Assim que o Mercado Pago confirmar, o acesso é liberado. Você pode atualizar o status em instantes." },
        failed: { Icon: CircleAlert, color: "text-red-700", title: "Não conseguimos concluir", text: "A assinatura não foi confirmada. Você pode tentar novamente." },
    }[result];
    return (_jsxs("div", { className: "mx-auto max-w-md space-y-4 text-center", children: [_jsx(view.Icon, { className: `mx-auto ${view.color}`, size: 48, "aria-hidden": true }), _jsx("h1", { className: "text-2xl font-bold", children: view.title }), _jsx("p", { className: "text-muted", children: view.text }), _jsxs("div", { className: "flex flex-wrap justify-center gap-2", children: [result === "authorized" && _jsx(Link, { to: "/", className: "btn-primary", children: "Ver receitas" }), result === "pending" && _jsx("button", { className: "btn-primary", onClick: check, children: "Atualizar status" }), result === "failed" && _jsx(Link, { to: "/planos", className: "btn-primary", children: "Tentar novamente" }), _jsx(Link, { to: "/assinatura", className: "btn-secondary", children: "Minha assinatura" })] })] }));
}
