import { admin, cors, getUser, json, mp, saveFromPreapproval } from "../_shared/mp.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") return json(405, { error: "Método não permitido" });
  const user = await getUser(req);
  if (!user) return json(401, { error: "Faça login." });

  const { data: sub } = await admin().from("subscriptions").select("mp_preapproval_id").eq("user_id", user.id).maybeSingle();
  if (!sub?.mp_preapproval_id) return json(404, { error: "Nenhuma assinatura encontrada." });

  const r = await mp(`/preapproval/${sub.mp_preapproval_id}`, { method: "PUT", body: JSON.stringify({ status: "cancelled" }) });
  if (!r.ok) return json(502, { error: "Não foi possível cancelar agora. Tente novamente." });

  await saveFromPreapproval({ ...r.body, external_reference: user.id });
  return json(200, { status: "cancelled" });
});
