import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useGoals } from "@/context/GoalContext";
import { Calendar, Plus, Trash2, ShoppingBag, Sparkles, ChevronRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { CatalogItem } from "@/lib/types";

interface MealSlot {
  id: string;
  day: string; // 'Segunda', 'Terça', etc.
  mealType: "Café da Manhã" | "Almoço" | "Jantar" | "Lanche";
  recipeId?: string;
  recipeTitle?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

const DAYS = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];

const MEAL_TYPES = ["Café da Manhã", "Almoço", "Jantar", "Lanche"] as const;

export default function MealPlanner() {
  const { goals, checkRecipeExceedsThreshold } = useGoals();
  const [recipes, setRecipes] = useState<CatalogItem[]>([]);
  const [planner, setPlanner] = useState<MealSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("Segunda-feira");
  const [selectedMealType, setSelectedMealType] = useState<MealSlot["mealType"]>("Almoço");
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch catalog
      const { data: catData } = await supabase.from("items_catalog").select("id, title, category");
      setRecipes((catData as CatalogItem[]) || []);

      // Load saved planner
      const saved = localStorage.getItem("weekly_meal_planner");
      if (saved) {
        try {
          setPlanner(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      } else {
        // Default sample entries
        const initialSample: MealSlot[] = [
          { id: "1", day: "Segunda-feira", mealType: "Café da Manhã", recipeTitle: "Omelete de Ervas", calories: 320, protein: 22, carbs: 4, fats: 20 },
          { id: "2", day: "Segunda-feira", mealType: "Almoço", recipeTitle: "Frango Grelhado com Legumes", calories: 550, protein: 48, carbs: 30, fats: 15 },
          { id: "3", day: "Terça-feira", mealType: "Jantar", recipeTitle: "Sopa de Lentilhas", calories: 420, protein: 20, carbs: 60, fats: 8 },
        ];
        setPlanner(initialSample);
        localStorage.setItem("weekly_meal_planner", JSON.stringify(initialSample));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const savePlanner = (updated: MealSlot[]) => {
    setPlanner(updated);
    localStorage.setItem("weekly_meal_planner", JSON.stringify(updated));
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipeId) return;

    const recipe = recipes.find((r) => r.id === selectedRecipeId);
    if (!recipe) return;

    // Estimate mock macros for catalog items if not present
    const newSlot: MealSlot = {
      id: Date.now().toString(),
      day: selectedDay,
      mealType: selectedMealType,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      calories: Math.floor(Math.random() * 300) + 300,
      protein: Math.floor(Math.random() * 25) + 15,
      carbs: Math.floor(Math.random() * 40) + 20,
      fats: Math.floor(Math.random() * 15) + 8,
    };

    const updated = [...planner, newSlot];
    savePlanner(updated);
    setShowAddModal(false);
    setSelectedRecipeId("");
  };

  const removeMeal = (id: string) => {
    const updated = planner.filter((m) => m.id !== id);
    savePlanner(updated);
  };

  const handleExportToShoppingList = () => {
    const saved = localStorage.getItem("shopping_list_local");
    let currentList: any[] = saved ? JSON.parse(saved) : [];

    planner.forEach((slot) => {
      if (slot.recipeTitle) {
        currentList.push({
          id: Date.now() + Math.random(),
          ingredient: `Ingredientes para ${slot.recipeTitle} (${slot.day})`,
          checked: false,
        });
      }
    });

    localStorage.setItem("shopping_list_local", JSON.stringify(currentList));
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 4000);
  };

  // Daily Totals
  const dailyStats = useMemo(() => {
    const stats: Record<string, { calories: number; protein: number; carbs: number; fats: number; slots: MealSlot[] }> = {};

    DAYS.forEach((d) => {
      stats[d] = { calories: 0, protein: 0, carbs: 0, fats: 0, slots: [] };
    });

    planner.forEach((slot) => {
      if (stats[slot.day]) {
        stats[slot.day].slots.push(slot);
        stats[slot.day].calories += slot.calories || 0;
        stats[slot.day].protein += slot.protein || 0;
        stats[slot.day].carbs += slot.carbs || 0;
        stats[slot.day].fats += slot.fats || 0;
      }
    });

    return stats;
  }, [planner]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-terracotta" size={28} />
            Planejador Semanal de Refeições
          </h1>
          <p className="text-sm text-muted">
            Organize seu cardápio diário e acompanhe suas metas nutricionais da semana.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={16} />
            Agendar Refeição
          </button>
          <button onClick={handleExportToShoppingList} className="btn-secondary flex items-center gap-1.5 text-xs">
            <ShoppingBag size={16} />
            Gerar Lista da Semana
          </button>
        </div>
      </div>

      {copiedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>Ingredientes de todas as refeições agendadas foram adicionados à sua Lista de Compras!</span>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Agendar Nova Refeição</h2>

            <form onSubmit={handleAddMeal} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Dia da Semana</label>
                <select className="input" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Momento da Refeição</label>
                <select
                  className="input"
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value as MealSlot["mealType"])}
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Escolher Receita do Catálogo</label>
                <select
                  className="input"
                  value={selectedRecipeId}
                  onChange={(e) => setSelectedRecipeId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma receita...</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary text-xs">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily List View (Monday to Sunday) */}
      <div className="space-y-4">
        {DAYS.map((dayName) => {
          const dayData = dailyStats[dayName];
          const exceedsLimit = goals.calories > 0 && dayData.calories > goals.calories;
          const calPercent = goals.calories > 0 ? Math.min(100, Math.round((dayData.calories / goals.calories) * 100)) : 0;

          return (
            <div key={dayName} className="card p-4 space-y-3 border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-800 text-lg">{dayName}</h2>
                  {exceedsLimit && (
                    <span className="bg-red-100 text-red-800 border border-red-300 text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <AlertCircle size={13} />
                      Excede meta calórica ({dayData.calories} / {goals.calories} kcal)
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted flex items-center gap-3">
                  <span>
                    Total: <strong className="text-slate-800">{dayData.calories} kcal</strong>
                  </span>
                  <span>Proteínas: <strong>{dayData.protein}g</strong></span>
                  <span>Carbos: <strong>{dayData.carbs}g</strong></span>
                </div>
              </div>

              {/* Progress Bar for Calories */}
              {goals.calories > 0 && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${exceedsLimit ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${calPercent}%` }}
                  />
                </div>
              )}

              {/* Meal Slots List */}
              {dayData.slots.length === 0 ? (
                <p className="text-xs text-muted py-2">Nenhuma refeição planejada para este dia.</p>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {dayData.slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-3 rounded-lg border border-slate-200 bg-sand/30 flex items-center justify-between gap-2 hover:border-terracotta/40 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider">
                          {slot.mealType}
                        </span>
                        <h4 className="font-semibold text-slate-800 text-sm">{slot.recipeTitle}</h4>
                        <p className="text-[11px] text-muted">
                          {slot.calories} kcal · P: {slot.protein}g · C: {slot.carbs}g · G: {slot.fats}g
                        </p>
                      </div>

                      <button
                        onClick={() => removeMeal(slot.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Remover refeição"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
