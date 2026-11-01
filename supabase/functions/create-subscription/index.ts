import { admin, cors, getUser, json, mp } from "../_shared/mp.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Método não permitido" });
  const user = await getUser(req);
  if (!user?.email) return json(401, { error: "Faça login para assinar." });

  const { data: cur } = await admin().from("subscriptions").select("status").eq("user_id", user.id).maybeSingle();
  if (cur?.status === "authorized") return json(409, { error: "Você já tem uma assinatura ativa." });

  const r = await mp("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: "Caderno de Receitas Premium",
      external_reference: user.id,
      payer_email: user.email,
      back_url: `${Deno.env.get("APP_URL")}/assinatura/retorno`,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: Number(Deno.env.get("SUBSCRIPTION_PRICE_BRL")),
        currency_id: "BRL",
      },
    }),
  });
  if (!r.ok) return json(502, { error: "Não foi possível iniciar a assinatura. Tente novamente." });

  await admin().from("subscriptions").upsert(
    { user_id: user.id, mp_preapproval_id: r.body.id, status: "pending", updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
  return json(200, { init_point: r.body.init_point });
});
