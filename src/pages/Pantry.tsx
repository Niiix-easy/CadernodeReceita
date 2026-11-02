import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePantry, PantryItem } from "@/context/PantryContext";
import { Package, AlertTriangle, Plus, Trash2, Search, Calendar, Clock, CheckCircle, Sparkles, ChefHat, Timer, ArrowRight, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/Spinner";

const CATEGORIES = ["Hortifruti", "Laticínios", "Açougue", "Mercearia", "Padaria", "Bebidas", "Limpeza", "Outros"];

interface SmartRecipe {
  title: string;
  prepTime: string;
  difficulty: string;
  usedIngredients: string[];
  extraIngredients?: string[];
  instructions: string;
}

export default function Pantry() {
  const { items, addItem, removeItem, expiringItems, loading } = usePantry();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Mercearia");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [shelfLifeDays, setShelfLifeDays] = useState(7);
  const [quantity, setQuantity] = useState("1 un");
  const [showAddForm, setShowAddForm] = useState(false);

  // Smart Recipes State
  const [smartRecipes, setSmartRecipes] = useState<SmartRecipe[]>([]);
  const [loadingSmartRecipes, setLoadingSmartRecipes] = useState(false);
  const [smartError, setSmartError] = useState<string | null>(null);
  const [activeRecipeModal, setActiveRecipeModal] = useState<SmartRecipe | null>(null);

  const fetchSmartRecipes = async () => {
    setLoadingSmartRecipes(true);
    setSmartError(null);
    try {
      const expiringNames = expiringItems.map((i) => i.name);
      const res = await fetch("/api/smart-pantry-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expiringItems: expiringNames }),
      });
      const data = await res.json();
      if (data.recipes && Array.isArray(data.recipes)) {
        setSmartRecipes(data.recipes);
      } else {
        setSmartError("Não foi possível gerar receitas no momento.");
      }
    } catch (e) {
      setSmartError("Erro ao conectar com a API Gemini para gerar receitas.");
    } finally {
      setLoadingSmartRecipes(false);
    }
  };

  // Auto-trigger smart recipes if items are expiring and none generated yet
  useEffect(() => {
    if (expiringItems.length > 0 && smartRecipes.length === 0 && !loadingSmartRecipes) {
      fetchSmartRecipes();
    }
  }, [expiringItems.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addItem({
      name: name.trim(),
      category,
      entry_date: entryDate,
      shelf_life_days: Number(shelfLifeDays),
      quantity,
    });

    setName("");
    setQuantity("1 un");
    setShowAddForm(false);
  };

  const handleSearchRecipe = (ingredientName: string) => {
    navigate(`/?q=${encodeURIComponent(ingredientName)}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Package className="text-terracotta" size={28} />
            Despensa & Validade de Ingredientes
          </h1>
          <p className="text-sm text-muted">
            Monitore o nível de urgência dos seus alimentos e aproveite sugestões de receitas rápidas do Gemini AI.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-1.5 text-xs"
        >
          <Plus size={16} />
          {showAddForm ? "Fechar Formulário" : "Novo Item na Despensa"}
        </button>
      </div>

      {/* Expiring Alert Banner */}
      {expiringItems.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/90 p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
            <AlertTriangle className="text-red-600 shrink-0" size={22} />
            <span>Atenção: {expiringItems.length} ingrediente(s) exigem consumo urgente!</span>
          </div>
          <p className="text-xs text-red-800">
            Estes alimentos vencerão nos próximos 3 dias ou já expiraram. Veja abaixo as receitas do Chef AI para consumi-los imediatamente:
          </p>
          <div className="flex flex-wrap gap-2">
            {expiringItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSearchRecipe(item.name)}
                className="bg-white hover:bg-red-100 text-red-800 border border-red-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Search size={13} />
                <span>Usar <strong>{item.name}</strong> em uma receita</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Smart Recipes Section (Gemini AI Powered) */}
      <div className="card p-5 space-y-4 border-terracotta/20 bg-gradient-to-br from-sand/50 to-amber-50/30">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-slate-200/60">
          <div className="flex items-center gap-2">
            <ChefHat size={24} className="text-terracotta" />
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                Receitas Inteligentes
                <span className="text-[10px] bg-terracotta text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={11} /> Gemini AI
                </span>
              </h2>
              <p className="text-xs text-muted">
                Sugestões de preparo rápido (menos de 25 min) aproveitando os itens perto do vencimento.
              </p>
            </div>
          </div>

          <button
            onClick={fetchSmartRecipes}
            disabled={loadingSmartRecipes}
            className="btn-secondary text-xs flex items-center gap-1.5 bg-white shrink-0"
          >
            <RefreshCw size={14} className={loadingSmartRecipes ? "animate-spin" : ""} />
            Gerar Novas Sugestões
          </button>
        </div>

        {loadingSmartRecipes ? (
          <div className="py-8 text-center space-y-2">
            <Spinner />
            <p className="text-xs text-muted">Analisando sua despensa e gerando 3 receitas rápidas com o Gemini AI...</p>
          </div>
        ) : smartError ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center justify-between">
            <span>{smartError}</span>
            <button onClick={fetchSmartRecipes} className="underline font-semibold ml-2">Tentar novamente</button>
          </div>
        ) : smartRecipes.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {smartRecipes.map((rec, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3 hover:border-terracotta/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1 text-[11px] text-muted">
                    <span className="font-semibold text-terracotta flex items-center gap-1">
                      <Timer size={13} /> {rec.prepTime}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      {rec.difficulty}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm leading-snug">{rec.title}</h3>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Ingredientes da Despensa:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {rec.usedIngredients.map((ing, i) => (
                        <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                          ✓ {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveRecipeModal(rec)}
                  className="w-full btn-primary text-xs py-1.5 flex items-center justify-center gap-1 mt-auto"
                >
                  <span>Ver Modo de Preparo</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted text-center py-4">
            Cadastre alimentos na despensa para que o Chef AI recomende receitas personalizadas.
          </p>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {activeRecipeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-2 border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider block">
                  Receita Inteligente Gemini AI
                </span>
                <h2 className="text-lg font-bold text-slate-900">{activeRecipeModal.title}</h2>
              </div>
              <button
                onClick={() => setActiveRecipeModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted">
              <span>⏱ Tempo: <strong>{activeRecipeModal.prepTime}</strong></span>
              <span>·</span>
              <span>Dificuldade: <strong>{activeRecipeModal.difficulty}</strong></span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ingredientes Utilizados:</h4>
              <div className="flex flex-wrap gap-1">
                {activeRecipeModal.usedIngredients.map((ing, i) => (
                  <span key={i} className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                    ✓ {ing}
                  </span>
                ))}
                {activeRecipeModal.extraIngredients?.map((ing, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    + {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Modo de Preparo Rápido:</h4>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line bg-sand/40 p-3 rounded-xl border border-slate-200">
                {activeRecipeModal.instructions}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setActiveRecipeModal(null)} className="btn-primary text-xs">
                Entendido / Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="card p-4 space-y-4 border-terracotta/30 bg-sand/50">
          <h3 className="font-bold text-slate-800 text-base">Cadastrar Item na Despensa</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Nome do Alimento / Ingrediente</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Queijo Muçarela, Leite, Cenouras..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Categoria</label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Data de Entrada / Compra</label>
              <input
                type="date"
                className="input"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Validade Estimada (Dias)</label>
              <input
                type="number"
                min="1"
                max="365"
                className="input"
                value={shelfLifeDays}
                onChange={(e) => setShelfLifeDays(Number(e.target.value))}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Quantidade / Unidade</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: 500g, 1L, 6 unidades..."
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary text-xs">
              Cancelar
            </button>
            <button type="submit" className="btn-primary text-xs">
              Salvar Alimento
            </button>
          </div>
        </form>
      )}

      {/* Items List with Visual Progress Bars & Color-Coded Urgency Status */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="font-bold text-slate-800 text-lg">Itens na Despensa ({items.length})</h2>
          <span className="text-xs text-muted">Classificação por Nível de Urgência</span>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Nenhum alimento cadastrado na despensa no momento.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => {
              // Calculate remaining shelf life percentage
              const totalDays = Math.max(1, item.shelf_life_days);
              const remainingDays = item.daysRemaining;
              const percentRemaining = Math.max(0, Math.min(100, Math.round((remainingDays / totalDays) * 100)));

              // Determine Color-coded Urgency status & Progress bar color
              let urgencyBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
              let progressBarClass = "bg-emerald-500";
              let urgencyLabel = "Fresco (Baixa)";
              let Icon = CheckCircle;

              if (remainingDays <= 1) {
                urgencyBadgeClass = "bg-red-100 text-red-800 border-red-300";
                progressBarClass = "bg-red-500";
                urgencyLabel = remainingDays <= 0 ? "Vencido! (Alta Urgência)" : "Vence Hoje! (Alta Urgência)";
                Icon = AlertTriangle;
              } else if (remainingDays <= 3) {
                urgencyBadgeClass = "bg-amber-100 text-amber-800 border-amber-300";
                progressBarClass = "bg-amber-500";
                urgencyLabel = `Urgência Média (${remainingDays}d)`;
                Icon = Clock;
              }

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-3 hover:border-terracotta/40 transition-colors shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span>{item.quantity}</span>
                        </div>
                      </div>

                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1 shrink-0 ${urgencyBadgeClass}`}>
                        <Icon size={12} />
                        {urgencyLabel}
                      </span>
                    </div>

                    {/* Visual Shelf Life Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-600 font-medium">
                        <span>Tempo de Validade Restante:</span>
                        <span>{remainingDays > 0 ? `${remainingDays} de ${totalDays} dias (${percentRemaining}%)` : "Expirado"}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
                        <div
                          className={`h-full transition-all duration-300 ${progressBarClass}`}
                          style={{ width: `${percentRemaining}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="text-muted flex items-center gap-1 text-[11px]">
                      <Calendar size={13} />
                      <span>Entrada: {new Date(item.entry_date + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSearchRecipe(item.name)}
                        className="text-terracotta hover:underline font-semibold flex items-center gap-1 px-2 py-1 bg-sand/60 rounded"
                        title="Ver receitas no catálogo com este ingrediente"
                      >
                        <Search size={12} />
                        Buscar Receitas
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Excluir alimento"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
