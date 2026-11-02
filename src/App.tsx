import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { supabaseConfigured } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { PremiumRoute, ProtectedRoute, PublicOnly } from "@/components/Guards";
import { useSyncSearchIndex } from "@/hooks/useSyncSearchIndex";
import { Spinner } from "@/components/Spinner";

const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Home = lazy(() => import("@/pages/Home"));
const ItemDetail = lazy(() => import("@/pages/ItemDetail"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const Plans = lazy(() => import("@/pages/Plans"));
const Profile = lazy(() => import("@/pages/Profile"));
const ShoppingList = lazy(() => import("@/pages/ShoppingList"));
const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
const Pantry = lazy(() => import("@/pages/Pantry"));
const Presentation = lazy(() => import("@/pages/Presentation"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const Subscription = lazy(() => import("@/pages/Subscription"));
const SubscriptionReturn = lazy(() => import("@/pages/SubscriptionReturn"));
const OfflineFallback = lazy(() => import("@/components/OfflineFallback").then(m => ({ default: m.OfflineFallback })));

function MissingConfig() {
  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-xl font-bold">Configuração pendente</h1>
      <p className="text-muted">
        Preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no arquivo <code>.env</code>{" "}
        (veja o <code>.env.example</code>) e reinicie o app.
      </p>
    </div>
  );
}

export default function App() {
  useSyncSearchIndex();
  if (!supabaseConfigured) return <MissingConfig />;
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner /></div>}>
      <Routes>
        {/* públicas */}
        <Route element={<PublicOnly />}>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/apresentacao" element={<Presentation />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/cadastrar" element={<Signup />} />
          <Route path="/esqueci-senha" element={<ForgotPassword />} />
        </Route>
        <Route path="/redefinir-senha" element={<ResetPassword />} />

        {/* logado */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/despensa" element={<Pantry />} />
            <Route path="/planos" element={<Plans />} />
            <Route path="/assinatura" element={<Subscription />} />
            <Route path="/assinatura/retorno" element={<SubscriptionReturn />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/lista-compras" element={<ShoppingList />} />
            <Route path="/planejador" element={<MealPlanner />} />

            {/* logado + assinatura ativa */}
            <Route element={<PremiumRoute />}>
              <Route path="/item/:id" element={<ItemDetail />} />
              <Route path="/favoritos" element={<Favorites />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/offline" element={<OfflineFallback />} />
      </Routes>
    </Suspense>
  );
}
