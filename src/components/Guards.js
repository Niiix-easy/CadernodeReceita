import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "./Spinner";
/** Exige login. */
export function ProtectedRoute() {
    const { user, loading } = useAuth();
    const loc = useLocation();
    if (loading)
        return _jsx(Spinner, {});
    if (!user)
        return _jsx(Navigate, { to: "/entrar", replace: true, state: { from: loc.pathname } });
    return _jsx(Outlet, {});
}
/** Exige login + assinatura ativa. */
export function PremiumRoute() {
    const { isPremium, loading } = useSubscription();
    if (loading)
        return _jsx(Spinner, {});
    if (!isPremium) {
        return _jsx(Navigate, { to: "/planos", replace: true, state: { message: "Esse conteúdo é para assinantes Premium." } });
    }
    return _jsx(Outlet, {});
}
/** Telas de login/cadastro: se já logado, vai para o início. */
export function PublicOnly() {
    const { user, loading } = useAuth();
    if (loading)
        return _jsx(Spinner, {});
    if (user)
        return _jsx(Navigate, { to: "/", replace: true });
    return _jsx(Outlet, {});
}
