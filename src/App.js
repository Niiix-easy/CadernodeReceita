import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: "mx-auto max-w-md p-8", children: [_jsx("h1", { className: "mb-2 text-xl font-bold", children: "Configura\u00E7\u00E3o pendente" }), _jsxs("p", { className: "text-muted", children: ["Preencha ", _jsx("code", { children: "VITE_SUPABASE_URL" }), " e ", _jsx("code", { children: "VITE_SUPABASE_ANON_KEY" }), " no arquivo ", _jsx("code", { children: ".env" }), " ", "(veja o ", _jsx("code", { children: ".env.example" }), ") e reinicie o app."] })] }));
}
export default function App() {
    useSyncSearchIndex();
    if (!supabaseConfigured)
        return _jsx(MissingConfig, {});
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(PublicOnly, {}), children: [_jsx(Route, { path: "/landing", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/apresentacao", element: _jsx(Presentation, {}) }), _jsx(Route, { path: "/entrar", element: _jsx(Login, {}) }), _jsx(Route, { path: "/cadastrar", element: _jsx(Signup, {}) }), _jsx(Route, { path: "/esqueci-senha", element: _jsx(ForgotPassword, {}) })] }), _jsx(Route, { path: "/redefinir-senha", element: _jsx(ResetPassword, {}) }), _jsx(Route, { element: _jsx(ProtectedRoute, {}), children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/planos", element: _jsx(Plans, {}) }), _jsx(Route, { path: "/assinatura", element: _jsx(Subscription, {}) }), _jsx(Route, { path: "/assinatura/retorno", element: _jsx(SubscriptionReturn, {}) }), _jsx(Route, { path: "/perfil", element: _jsx(Profile, {}) }), _jsx(Route, { path: "/lista-compras", element: _jsx(ShoppingList, {}) }), _jsx(Route, { path: "/planejador", element: _jsx(MealPlanner, {}) }), _jsxs(Route, { element: _jsx(PremiumRoute, {}), children: [_jsx(Route, { path: "/item/:id", element: _jsx(ItemDetail, {}) }), _jsx(Route, { path: "/favoritos", element: _jsx(Favorites, {}) })] })] }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) }), _jsx(Route, { path: "/offline", element: _jsx(OfflineFallback, {}) })] }));
}
