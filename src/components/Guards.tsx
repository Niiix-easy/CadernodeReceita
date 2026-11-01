import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Spinner } from "./Spinner";

/** Exige login. */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/entrar" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

/** Exige login + assinatura ativa. */
export function PremiumRoute() {
  const { isPremium, loading } = useSubscription();
  if (loading) return <Spinner />;
  if (!isPremium) {
    return <Navigate to="/planos" replace state={{ message: "Esse conteúdo é para assinantes Premium." }} />;
  }
  return <Outlet />;
}

/** Telas de login/cadastro: se já logado, vai para o início. */
export function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
