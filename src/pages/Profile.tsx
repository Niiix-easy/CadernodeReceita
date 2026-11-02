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

  return (
    <div className="card space-y-4">
      <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Status da Assinatura:</strong> {isPremium ? "Premium" : "Grátis"}</p>
      <div className="flex gap-2">
        <Link to="/assinatura" className="btn-primary inline-block text-center">Gerenciar Assinatura</Link>
        <button className="btn-secondary" onClick={async () => {
            if (user) {
                await recordActivity(user.id, 'recipe_cooked');
                window.location.reload();
            }
        }}>Marcar como Cozinhado Hoje</button>
      </div>
      <hr className="my-4" />
      <CookingStreak />
      <hr className="my-4" />
      <WeeklyNutritionReport />
      <hr className="my-4" />
      <ActivityDashboard />
      <hr className="my-4" />
      <AccessibilityReport />
      <hr className="my-4" />
      <AuthorDashboard />
      <hr className="my-4" />
      <SearchTrends />
      <hr className="my-4" />
      <UserCollections />
    </div>
  );
}
