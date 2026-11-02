import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";
const Ctx = createContext(null);
export function isActive(s) {
    if (!s)
        return false;
    if (s.status === "authorized")
        return true;
    return s.access_until ? new Date(s.access_until).getTime() > Date.now() : false;
}
export function SubscriptionProvider({ children }) {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const refresh = useCallback(async () => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }
        const { data } = await supabase
            .from("subscriptions")
            .select("status,next_payment_date,access_until")
            .eq("user_id", user.id)
            .maybeSingle();
        setSubscription(data ?? null);
        setLoading(false);
    }, [user]);
    useEffect(() => { setLoading(true); void refresh(); }, [refresh]);
    const sync = useCallback(async () => {
        const { error } = await supabase.functions.invoke("sync-subscription");
        if (error)
            return "Não foi possível atualizar o status agora. Tente novamente.";
        await refresh();
        return null;
    }, [refresh]);
    const value = useMemo(() => ({ subscription, isPremium: isActive(subscription), loading, refresh, sync }), [subscription, loading, refresh, sync]);
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useSubscription() {
    const v = useContext(Ctx);
    if (!v)
        throw new Error("useSubscription fora do SubscriptionProvider");
    return v;
}
