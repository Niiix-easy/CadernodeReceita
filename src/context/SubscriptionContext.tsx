import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Subscription } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface SubValue {
  subscription: Subscription | null;
  isPremium: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Pede ao servidor para consultar o Mercado Pago e atualizar o status. */
  sync: () => Promise<string | null>;
}

const Ctx = createContext<SubValue | null>(null);

export function isActive(s: Subscription | null): boolean {
  if (!s) return false;
  if (s.status === "authorized") return true;
  return s.access_until ? new Date(s.access_until).getTime() > Date.now() : false;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    const { data } = await supabase
      .from("subscriptions")
      .select("status,next_payment_date,access_until")
      .eq("user_id", user.id)
      .maybeSingle();
    setSubscription((data as Subscription | null) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { setLoading(true); void refresh(); }, [refresh]);

  const sync = useCallback(async () => {
    const { error } = await supabase.functions.invoke("sync-subscription");
    if (error) return "Não foi possível atualizar o status agora. Tente novamente.";
    await refresh();
    return null;
  }, [refresh]);

  const value = useMemo(() => ({ subscription, isPremium: isActive(subscription), loading, refresh, sync }),
    [subscription, loading, refresh, sync]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubscription() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSubscription fora do SubscriptionProvider");
  return v;
}
