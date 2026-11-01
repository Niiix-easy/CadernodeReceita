import { Navigate, Route, Routes } from "react-router-dom";
import { supabaseConfigured } from "@/lib/supabase";
import { Layout } from "@/components/Layout";
import { PremiumRoute, ProtectedRoute, PublicOnly } from "@/components/Guards";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Home from "@/pages/Home";
import ItemDetail from "@/pages/ItemDetail";
import Favorites from "@/pages/Favorites";
import Plans from "@/pages/Plans";
import Profile from "@/pages/Profile";
import ShoppingList from "@/pages/ShoppingList";
import MealPlanner from "@/pages/MealPlanner";
import Presentation from "@/pages/Presentation";
import LandingPage from "@/pages/LandingPage";
import Subscription from "@/pages/Subscription";
import { useSyncSearchIndex } from "@/hooks/useSyncSearchIndex";
import SubscriptionReturn from "@/pages/SubscriptionReturn";
import { OfflineFallback } from "@/components/OfflineFallback";

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
  );
}
