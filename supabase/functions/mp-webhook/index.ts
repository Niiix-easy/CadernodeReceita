import { mp, saveFromPreapproval } from "../_shared/mp.ts";

const enc = new TextEncoder();
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function validSignature(req: Request, dataId: string) {
  const parts = Object.fromEntries(
    (req.headers.get("x-signature") ?? "").split(",").map((p) => p.trim().split("=") as [string, string]),
  );
  if (!parts.ts || !parts.v1) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${req.headers.get("x-request-id") ?? ""};ts:${parts.ts};`;
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(Deno.env.get("MP_WEBHOOK_SECRET")!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const mac = hex(await crypto.subtle.sign("HMAC", key, enc.encode(manifest)));
  return safeEqual(mac, parts.v1);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));
  const dataId = String(url.searchParams.get("data.id") ?? body?.data?.id ?? "");
  const type = String(body?.type ?? url.searchParams.get("type") ?? "");
  if (!dataId || !(await validSignature(req, dataId))) return new Response("invalid", { status: 401 });

  // Só nos interessam eventos de assinatura; o estado real é sempre lido na API do Mercado Pago.
  if (type === "subscription_preapproval") {
    const r = await mp(`/preapproval/${dataId}`);
    if (r.ok) await saveFromPreapproval(r.body);
    else return new Response("retry", { status: 500 }); // o Mercado Pago reenvia
  }
  return new Response("ok", { status: 200 });
});
