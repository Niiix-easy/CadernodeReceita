import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

export const admin = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

export async function getUser(req: Request) {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data } = await sb.auth.getUser();
  return data.user;
}

export async function mp(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${Deno.env.get("MP_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

// Grava o estado da assinatura a partir do objeto "preapproval" do Mercado Pago.
export async function saveFromPreapproval(pre: any) {
  const userId = pre.external_reference;
  if (!userId) return;
  const status = ["authorized", "paused", "cancelled", "pending"].includes(pre.status) ? pre.status : "pending";
  const next = pre.next_payment_date ?? null;
  const row: Record<string, unknown> = {
    user_id: userId,
    mp_preapproval_id: pre.id,
    status,
    next_payment_date: next,
    updated_at: new Date().toISOString(),
  };
  // O acesso vai até o próximo vencimento já pago (vale também após cancelar).
  if (next && status !== "pending") row.access_until = next;
  await admin().from("subscriptions").upsert(row, { onConflict: "user_id" });
}
