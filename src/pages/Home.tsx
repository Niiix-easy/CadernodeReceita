import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Mic, Activity, AlertTriangle, Package, Target } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveItems, getItems } from "@/lib/db";
import { type CatalogItem } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { Spinner } from "@/components/Spinner";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalContext";
import { usePantry } from "@/context/PantryContext";
import { CategorySelector } from "@/components/CategorySelector";
import { CommunityFeed } from "@/components/CommunityFeed";
import stringSimilarity from "string-similarity";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import { RecordingWaveform } from "@/components/RecordingWaveform";
import { trackEvent } from "@/lib/analytics";

const TABS = ["receitas de comidas", "receitas de saude", "receitas de produçao de produtos artesanais", "outros", "industrial"];

export default function Home() {
  const [searchParams] = useSearchParams();
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const { goals, setGoals } = useGoals();
  const { expiringItems } = usePantry();

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [q, setQ] = useState(searchParams.get("q") || "");
  const debouncedQ = useDebounce(q, 300);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [recommendations, setRecommendations] = useState<CatalogItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showGoalEdit, setShowGoalEdit] = useState(false);

  // Edit Goal Form
  const [tempCalories, setTempCalories] = useState(goals.calories);
  const [tempProtein, setTempProtein] = useState(goals.protein);
  const [tempCarbs, setTempCarbs] = useState(goals.carbs);
  const [tempFats, setTempFats] = useState(goals.fats);

  useEffect(() => {
    const urlQ = searchParams.get("q");
    if (urlQ) setQ(urlQ);
  }, [searchParams]);

  useEffect(() => {
    const saved = localStorage.getItem("recent_searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const newSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem("recent_searches", JSON.stringify(newSearches));
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error: e } = await supabase.from("items_catalog").select("*").order("id");
        if (!alive) return;
        if (e) throw e;
        setItems((data ?? []) as CatalogItem[]);
        setLoading(false);
        await saveItems(data ?? []);

        if (user) {
          const { data: favs } = await supabase.from("favorites").select("item:items(category)");
          const favoriteCategories = new Set((favs || []).map((f) => (f.item as any)?.category));

          const recs = (data || [])
            .filter((i) => !favoriteCategories.has(i.category))
            .slice(0, 3);
          setRecommendations(recs);
        }
      } catch (err) {
        if (!alive) return;
        setError("Offline: carregando dados salvos.");
        const cached = await getItems();
        setItems(cached);
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const visible = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return items.filter(
      (i) =>
        (selectedTabs.length === 0 || selectedTabs.includes(i.category)) &&
        (!term || i.title.toLowerCase().includes(term) || (i as any).ingredients?.some((ing: string) => ing.toLowerCase().includes(term))) &&
        (difficulty === "all" || i.level === difficulty)
    );
  }, [items, selectedTabs, debouncedQ, difficulty]);

  const suggestions = useMemo(() => {
    if (q.length < 3 || visible.length > 0) return null;
    const allTitles = items.map((i) => i.title);
    const match = stringSimilarity.findBestMatch(q, allTitles);
    return match.bestMatch.rating > 0.3 ? match.bestMatch.target : null;
  }, [q, items, visible]);

  const handleSaveGoals = () => {
    setGoals({
      calories: Number(tempCalories),
      protein: Number(tempProtein),
      carbs: Number(tempCarbs),
      fats: Number(tempFats),
    });
    setShowGoalEdit(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <TutorialOverlay />
      <div className="md:col-span-2 space-y-5">
        {!isPremium && (
          <div className="card flex flex-wrap items-center justify-between gap-3 border-terracotta/30 bg-sand">
            <p className="text-sm">Você está no plano Grátis: vê o catálogo. Assine o Premium para abrir receitas, vídeos e favoritos.</p>
            <Link to="/planos" className="btn-primary">
              Ver planos
            </Link>
          </div>
        )}

        {/* Expiring Pantry Notice Banner */}
        {expiringItems.length > 0 && (
          <div className="card border-amber-300 bg-amber-50/80 p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-900">
              <Package className="text-amber-600 shrink-0" size={20} />
              <span>
                <strong>{expiringItems.length} ingrediente(s)</strong> na despensa estão perto de vencer!
              </span>
            </div>
            <Link to="/despensa" className="btn-secondary text-xs shrink-0 font-medium">
              Ver Despensa
            </Link>
          </div>
        )}

        {/* Goals Summary & Config Widget */}
        <div className="card p-4 space-y-3 border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
              <Target className="text-terracotta" size={20} />
              <span>Sua Meta Nutricional Diária</span>
            </div>
            <button
              onClick={() => setShowGoalEdit(!showGoalEdit)}
              className="text-xs text-terracotta hover:underline font-semibold"
            >
              {showGoalEdit ? "Cancelar" : "Ajustar Metas"}
            </button>
          </div>

          {!showGoalEdit ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-sand/50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Calorias</span>
                <span className="text-base font-bold text-slate-800">{goals.calories} kcal</span>
              </div>
              <div className="bg-sand/50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Proteínas</span>
                <span className="text-base font-bold text-slate-800">{goals.protein} g</span>
              </div>
              <div className="bg-sand/50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Carboidratos</span>
                <span className="text-base font-bold text-slate-800">{goals.carbs} g</span>
              </div>
              <div className="bg-sand/50 p-2 rounded-lg border border-slate-200/60">
                <span className="text-[10px] text-muted block uppercase tracking-wider font-semibold">Gorduras</span>
                <span className="text-base font-bold text-slate-800">{goals.fats} g</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Calorias (kcal)</label>
                  <input
                    type="number"
                    className="input text-xs"
                    value={tempCalories}
                    onChange={(e) => setTempCalories(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Proteínas (g)</label>
                  <input
                    type="number"
                    className="input text-xs"
                    value={tempProtein}
                    onChange={(e) => setTempProtein(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Carboidratos (g)</label>
                  <input
                    type="number"
                    className="input text-xs"
                    value={tempCarbs}
                    onChange={(e) => setTempCarbs(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Gorduras (g)</label>
                  <input
                    type="number"
                    className="input text-xs"
                    value={tempFats}
                    onChange={(e) => setTempFats(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveGoals} className="btn-primary text-xs py-1.5 px-3">
                  Salvar Metas
                </button>
              </div>
            </div>
          )}
        </div>

        {recommendations.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Recomendado para Você</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((i) => (
                <li key={i.id}>
                  <ItemCard item={i} locked={!isPremium} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Global Voice & Keyword Search */}
        <div className="space-y-2">
          <div className="relative">
            <label htmlFor="busca" className="sr-only">
              Buscar por título, ingrediente ou culinária
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden />
            <input
              id="busca"
              type="search"
              className="input pl-10 pr-10 h-[48px]"
              placeholder="Buscar por nome, ingrediente, dieta ou culinária..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveSearch(q);
                  trackEvent("search_perform", q);
                }
              }}
            />
            {isListening && <RecordingWaveform />}
            <button
              type="button"
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                isListening ? "text-red-500 animate-pulse" : "text-muted"
              } hover:text-terracotta`}
              onClick={() => {
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                if (SpeechRecognition) {
                  const recognition = new SpeechRecognition();
                  recognition.lang = "pt-BR";
                  recognition.onstart = () => setIsListening(true);
                  recognition.onend = () => setIsListening(false);
                  recognition.onresult = (event: any) => {
                    const voiceText = event.results[0][0].transcript;
                    setQ(voiceText);
                    saveSearch(voiceText);
                  };
                  recognition.start();
                } else {
                  alert("Pesquisa por voz não é suportada neste navegador.");
                }
              }}
              title="Pesquisar por Voz (fale o ingrediente ou prato)"
            >
              <Mic size={20} aria-hidden />
            </button>
          </div>

          <div className="flex gap-2">
            <CategorySelector
              selected={selectedTabs}
              onSelect={(tabs) => {
                setSelectedTabs(tabs);
                trackEvent("category_filter_apply", tabs.join(", "));
              }}
              categories={TABS}
            />
            <select
              className="input h-[44px] text-xs"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                trackEvent("difficulty_filter_apply", e.target.value);
              }}
            >
              <option value="all">Todas as Dificuldades</option>
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        ) : visible.length === 0 ? (
          <div className="card text-center py-8">
            <p className="font-medium">Nada encontrado para “{q}”.</p>
            {suggestions && (
              <button className="text-terracotta hover:underline block w-full mt-2 text-sm" onClick={() => setQ(suggestions)}>
                Você quis dizer “{suggestions}”?
              </button>
            )}
            <button className="btn-secondary mt-3 text-xs" onClick={() => setQ("")}>
              Limpar busca
            </button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visible.map((i) => (
              <li key={i.id}>
                <ItemCard item={i} locked={!isPremium} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside>
        <CommunityFeed />
      </aside>
    </div>
  );
}
