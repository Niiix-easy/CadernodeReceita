import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Mic } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveItems, getItems } from "@/lib/db";
import { type CatalogItem, type Category } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { Spinner } from "@/components/Spinner";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalContext";
import { CategorySelector } from "@/components/CategorySelector";
import { CommunityFeed } from "@/components/CommunityFeed";
import stringSimilarity from 'string-similarity';
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { useDebounce } from "@/hooks/useDebounce";
import { RecordingWaveform } from "@/components/RecordingWaveform";
import { trackEvent } from "@/lib/analytics";

const TABS = ["receitas de comidas", "receitas de saude", "receitas de produçao de produtos artesanais", "outros", "industrial"];

export default function Home() {
  const { isPremium } = useSubscription();
  const { user } = useAuth();
  const { goals, setGoals } = useGoals();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 300);
  const [difficulty, setDifficulty] = useState<string>("all");
  const [recommendations, setRecommendations] = useState<CatalogItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newSearches);
    localStorage.setItem('recent_searches', JSON.stringify(newSearches));
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error: e } = await supabase.from("items_catalog").select("id,category,title,level,time").order("id");
        if (!alive) return;
        if (e) throw e;
        setItems((data ?? []) as CatalogItem[]);
        setLoading(false);
        await saveItems(data ?? []);
        
        if (user) {
          const { data: favs } = await supabase.from('favorites').select('item:items(category)');
          const favoriteCategories = new Set((favs || []).map(f => (f.item as any)?.category));
          
          const recs = (data || [])
            .filter(i => !favoriteCategories.has(i.category))
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
    return () => { alive = false; };
  }, [user]);

  const visible = useMemo(() => {
    const term = debouncedQ.trim().toLowerCase();
    return items.filter((i) => (selectedTabs.length === 0 || selectedTabs.includes(i.category)) && (!term || i.title.toLowerCase().includes(term)) && (difficulty === "all" || i.level === difficulty));
  }, [items, selectedTabs, debouncedQ, difficulty]);

  const suggestions = useMemo(() => {
    if (q.length < 3 || visible.length > 0) return null;
    const allTitles = items.map(i => i.title);
    const match = stringSimilarity.findBestMatch(q, allTitles);
    return match.bestMatch.rating > 0.3 ? match.bestMatch.target : null;
  }, [q, items, visible]);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <TutorialOverlay />
      <div className="md:col-span-2 space-y-5">
        {!isPremium && (
          <div className="card flex flex-wrap items-center justify-between gap-3 border-terracotta/30 bg-sand">
            <p className="text-sm">Você está no plano Grátis: vê o catálogo. Assine o Premium para abrir receitas, vídeos e favoritos.</p>
            <Link to="/planos" className="btn-primary">Ver planos</Link>
          </div>
        )}

        <div className="card">
            <h2 className="text-lg font-bold mb-2">Meta Calórica Diária</h2>
            <div className="flex gap-2">
                <input type="number" className="input" placeholder="Calorias" value={goals?.calories || ''} onChange={(e) => setGoals({ ...goals!, calories: parseInt(e.target.value) || 0 })} />
                <button className="btn-primary" onClick={() => setGoals(goals!)}>Salvar</button>
            </div>
            {goals && <p className="text-sm text-muted mt-2">Meta: {goals.calories} kcal</p>}
        </div>

        {recommendations.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-lg font-bold">Recomendado para Você</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {recommendations.map((i) => <li key={i.id}><ItemCard item={i} locked={!isPremium} /></li>)}
            </ul>
          </section>
        )}

        <div className="flex gap-2">
            <CategorySelector 
            selected={selectedTabs} 
            onSelect={(tabs) => {
                setSelectedTabs(tabs);
                trackEvent('category_filter_apply', tabs.join(', '));
            }} 
            categories={TABS} 
            />
            <select className="input h-[44px]" value={difficulty} onChange={(e) => {
                setDifficulty(e.target.value);
                trackEvent('difficulty_filter_apply', e.target.value);
            }}>
                <option value="all">Todas</option>
                <option value="Fácil">Fácil</option>
                <option value="Médio">Médio</option>
                <option value="Difícil">Difícil</option>
            </select>
        </div>

  return (
    // ...
        <div className="relative">
          <label htmlFor="busca" className="sr-only">Buscar por título</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} aria-hidden />
          <input id="busca" type="search" className="input pl-10 pr-10" placeholder="Buscar por título ou ingredientes" value={q}
            onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => {
              if (e.key === 'Enter') {
                saveSearch(q);
                trackEvent('search_perform', q);
              }
            }} />
          {isListening && <RecordingWaveform />}
          <button 
            type="button" 
            className={`absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-500' : 'text-muted'} hover:text-terracotta`}
            onClick={() => {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.lang = 'pt-BR';
                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onresult = (event: any) => { setQ(event.results[0][0].transcript); saveSearch(event.results[0][0].transcript); };
                recognition.start();
              }
            }}
            aria-label="Pesquisar por voz"
          >
            <Mic size={18} aria-hidden />
          </button>
          {recentSearches.length > 0 && (
            <div className="absolute w-full bg-white border border-ink/10 rounded-xl mt-1 shadow-md z-20">
              {recentSearches.map(s => <button key={s} className="block w-full text-left p-2 hover:bg-sand" onClick={() => { setQ(s); saveSearch(s); }}>{s}</button>)}
            </div>
          )}
        </div>

        {loading ? <Spinner /> : error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
        ) : visible.length === 0 ? (
          <div className="card text-center">
            <p className="font-medium">Nada encontrado para “{q}”.</p>
            {suggestions && (
                <button className="text-terracotta hover:underline block w-full mt-2" onClick={() => setQ(suggestions)}>Você quis dizer “{suggestions}”?</button>
            )}
            <button className="btn-secondary mt-3" onClick={() => setQ("")}>Limpar busca</button>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {visible.map((i) => <li key={i.id}><ItemCard item={i} locked={!isPremium} /></li>)}
          </ul>
        )}
      </div>
      <aside>
        <CommunityFeed />
      </aside>
    </div>
  );
}
