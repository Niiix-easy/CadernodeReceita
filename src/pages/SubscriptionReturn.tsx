import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, Clock, CircleAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "@/components/Spinner";

type Result = "checking" | "authorized" | "pending" | "failed";

/** Para onde o Mercado Pago devolve o cliente depois do pagamento. */
export default function SubscriptionReturn() {
  const { refresh } = useSubscription();
  const [result, setResult] = useState<Result>("checking");
  const ran = useRef(false);

  async function check() {
    setResult("checking");
    const { data, error } = await supabase.functions.invoke<{ status?: string }>("sync-subscription");
    await refresh();
    if (error) setResult("failed");
    else if (data?.status === "authorized") setResult("authorized");
    else if (data?.status === "pending" || data?.status === "paused") setResult("pending");
    else setResult("failed");
  }

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    void check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (result === "checking") return <Spinner label="Confirmando seu pagamento…" />;

  const view = {
    authorized: { Icon: CircleCheck, color: "text-green-700", title: "Assinatura ativa!", text: "Obrigado! Todo o conteúdo Premium já está liberado." },
    pending: { Icon: Clock, color: "text-amber-700", title: "Pagamento em análise", text: "Assim que o Mercado Pago confirmar, o acesso é liberado. Você pode atualizar o status em instantes." },
    failed: { Icon: CircleAlert, color: "text-red-700", title: "Não conseguimos concluir", text: "A assinatura não foi confirmada. Você pode tentar novamente." },
  }[result];

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <view.Icon className={`mx-auto ${view.color}`} size={48} aria-hidden />
      <h1 className="text-2xl font-bold">{view.title}</h1>
      <p className="text-muted">{view.text}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {result === "authorized" && <Link to="/" className="btn-primary">Ver receitas</Link>}
        {result === "pending" && <button className="btn-primary" onClick={check}>Atualizar status</button>}
        {result === "failed" && <Link to="/planos" className="btn-primary">Tentar novamente</Link>}
        <Link to="/assinatura" className="btn-secondary">Minha assinatura</Link>
      </div>
    </div>
  );
}
