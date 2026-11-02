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

import { usePace, CookingPace } from "@/context/PaceContext";
import { useGoals } from "@/context/GoalContext";
import { Gauge, Target } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { pace, setPace, speechRate } = usePace();
  const { goals, setGoals } = useGoals();

  return (
    <div className="card space-y-5">
      <h1 className="text-2xl font-bold">Perfil do Usuário & Configurações</h1>
      <div className="grid gap-2 text-sm bg-sand/40 p-3 rounded-xl border">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Status da Assinatura:</strong> {isPremium ? "Premium" : "Grátis"}</p>
      </div>

      {/* Global Cooking Pace Preference */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Gauge className="text-terracotta" size={20} />
          <span>Ritmo de Cozinha Preferido (Cooking Pace)</span>
        </div>
        <p className="text-xs text-muted">
          Ajusta a velocidade da leitura por voz e a sensibilidade dos comandos na tela de preparação:
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { id: "slow", label: "Lento (0.8x)", desc: "Tranquilo" },
            { id: "normal", label: "Moderado (1.0x)", desc: "Padrão" },
            { id: "fast", label: "Rápido (1.25x)", desc: "Ágil" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPace(item.id as CookingPace)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                pace === item.id
                  ? "bg-terracotta text-white border-terracotta font-bold shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200"
              }`}
            >
              <div className="text-xs">{item.label}</div>
              <div className={`text-[10px] ${pace === item.id ? "text-white/80" : "text-muted"}`}>{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Nutritional Goals Manager */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Target className="text-terracotta" size={20} />
          <span>Metas Nutricionais Diárias</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Calorias (kcal)</label>
            <input
              type="number"
              className="input text-xs"
              value={goals.calories}
              onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Proteínas (g)</label>
            <input
              type="number"
              className="input text-xs"
              value={goals.protein}
              onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Carboidratos (g)</label>
            <input
              type="number"
              className="input text-xs"
              value={goals.carbs}
              onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">Gorduras (g)</label>
            <input
              type="number"
              className="input text-xs"
              value={goals.fats}
              onChange={(e) => setGoals({ ...goals, fats: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Link to="/assinatura" className="btn-primary inline-block text-center text-xs">Gerenciar Assinatura</Link>
        <button className="btn-secondary text-xs" onClick={async () => {
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
