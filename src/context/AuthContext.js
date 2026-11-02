import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
const Ctx = createContext(null);
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        }).catch(() => setLoading(false));
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
        return () => sub.subscription.unsubscribe();
    }, []);
    const value = useMemo(() => ({
        user: session?.user ?? null,
        session,
        loading,
        signIn: async (email, password) => {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            return error?.message ?? null;
        },
        signUp: async (email, password) => {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { emailRedirectTo: window.location.origin },
            });
            return { error: error?.message ?? null, needsConfirmation: !error && !data.session };
        },
        signOut: async () => { await supabase.auth.signOut(); },
        sendReset: async (email) => {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/redefinir-senha`,
            });
            return error?.message ?? null;
        },
        updatePassword: async (password) => {
            const { error } = await supabase.auth.updateUser({ password });
            return error?.message ?? null;
        },
    }), [session, loading]);
    return _jsx(Ctx.Provider, { value: value, children: children });
}
export function useAuth() {
    const v = useContext(Ctx);
    if (!v)
        throw new Error("useAuth fora do AuthProvider");
    return v;
}
