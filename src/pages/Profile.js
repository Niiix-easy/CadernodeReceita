import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { Link } from "react-router-dom";
import { ActivityDashboard } from "@/components/ActivityDashboard";
import { AccessibilityReport } from "@/components/AccessibilityReport";
import { AuthorDashboard } from "@/components/AuthorDashboard";
import { SearchTrends } from "@/components/SearchTrends";
import { UserCollections } from "@/components/UserCollections";
import { CookingStreak } from "@/components/CookingStreak";
import { WeeklyNutritionReport } from "@/components/WeeklyNutritionReport";
import { recordActivity } from "@/lib/streaks";
export default function Profile() {
    const { user } = useAuth();
    const { isPremium } = useSubscription();
    return (_jsxs("div", { className: "card space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Perfil do Usu\u00E1rio" }), _jsxs("p", { children: [_jsx("strong", { children: "Email:" }), " ", user?.email] }), _jsxs("p", { children: [_jsx("strong", { children: "Status da Assinatura:" }), " ", isPremium ? "Premium" : "Grátis"] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Link, { to: "/assinatura", className: "btn-primary inline-block text-center", children: "Gerenciar Assinatura" }), _jsx("button", { className: "btn-secondary", onClick: async () => {
                            if (user) {
                                await recordActivity(user.id, 'recipe_cooked');
                                window.location.reload();
                            }
                        }, children: "Marcar como Cozinhado Hoje" })] }), _jsx("hr", { className: "my-4" }), _jsx(CookingStreak, {}), _jsx("hr", { className: "my-4" }), _jsx(WeeklyNutritionReport, {}), _jsx("hr", { className: "my-4" }), _jsx(ActivityDashboard, {}), _jsx("hr", { className: "my-4" }), _jsx(AccessibilityReport, {}), _jsx("hr", { className: "my-4" }), _jsx(AuthorDashboard, {}), _jsx("hr", { className: "my-4" }), _jsx(SearchTrends, {}), _jsx("hr", { className: "my-4" }), _jsx(UserCollections, {})] }));
}
