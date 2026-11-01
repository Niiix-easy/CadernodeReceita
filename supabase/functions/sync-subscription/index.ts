import { admin, cors, getUser, json, mp, saveFromPreapproval } from "../_shared/mp.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const user = await getUser(req);
  if (!user) return json(401, { error: "Faça login." });

  const { data: sub } = await admin().from("subscriptions").select("mp_preapproval_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.mp_preapproval_id) return json(200, { status: "none" });

  const r = await mp(`/preapproval/${sub.mp_preapproval_id}`);
  if (!r.ok) return json(502, { error: "Não foi possível consultar a assinatura agora." });
  if (r.body.external_reference !== user.id) return json(403, { error: "Assinatura inválida." });

  await saveFromPreapproval(r.body);
  return json(200, { status: r.body.status });
});
