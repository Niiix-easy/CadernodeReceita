import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Mic } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveItems, getItems } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";
import { Spinner } from "@/components/Spinner";
import { useSubscription } from "@/context/SubscriptionContext";
import { useAuth } from "@/context/AuthContext";
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
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTabs, setSelectedTabs] = useState([]);
    const [q, setQ] = useState("");
    const debouncedQ = useDebounce(q, 300);
    const [difficulty, setDifficulty] = useState("all");
    const [recommendations, setRecommendations] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isListening, setIsListening] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem('recent_searches');
        if (saved)
            setRecentSearches(JSON.parse(saved));
    }, []);
    const saveSearch = (query) => {
        if (!query.trim())
            return;
        const newSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(newSearches);
        localStorage.setItem('recent_searches', JSON.stringify(newSearches));
    };
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const { data, error: e } = await supabase.from("items_catalog").select("id,category,title,level,time").order("id");
                if (!alive)
                    return;
                if (e)
                    throw e;
                setItems((data ?? []));
                setLoading(false);
                await saveItems(data ?? []);
                if (user) {
                    const { data: favs } = await supabase.from('favorites').select('item:items(category)');
                    const favoriteCategories = new Set((favs || []).map(f => f.item?.category));
                    const recs = (data || [])
                        .filter(i => !favoriteCategories.has(i.category))
                        .slice(0, 3);
                    setRecommendations(recs);
                }
            }
            catch (err) {
                if (!alive)
                    return;
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
        if (q.length < 3 || visible.length > 0)
            return null;
        const allTitles = items.map(i => i.title);
        const match = stringSimilarity.findBestMatch(q, allTitles);
        return match.bestMatch.rating > 0.3 ? match.bestMatch.target : null;
    }, [q, items, visible]);
    return (_jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [_jsx(TutorialOverlay, {}), _jsxs("div", { className: "md:col-span-2 space-y-5", children: [!isPremium && (_jsxs("div", { className: "card flex flex-wrap items-center justify-between gap-3 border-terracotta/30 bg-sand", children: [_jsx("p", { className: "text-sm", children: "Voc\u00EA est\u00E1 no plano Gr\u00E1tis: v\u00EA o cat\u00E1logo. Assine o Premium para abrir receitas, v\u00EDdeos e favoritos." }), _jsx(Link, { to: "/planos", className: "btn-primary", children: "Ver planos" })] })), recommendations.length > 0 && (_jsxs("section", { className: "space-y-2", children: [_jsx("h2", { className: "text-lg font-bold", children: "Recomendado para Voc\u00EA" }), _jsx("ul", { className: "grid gap-3 sm:grid-cols-2", children: recommendations.map((i) => _jsx("li", { children: _jsx(ItemCard, { item: i, locked: !isPremium }) }, i.id)) })] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(CategorySelector, { selected: selectedTabs, onSelect: (tabs) => {
                                    setSelectedTabs(tabs);
                                    trackEvent('category_filter_apply', tabs.join(', '));
                                }, categories: TABS }), _jsxs("select", { className: "input h-[44px]", value: difficulty, onChange: (e) => {
                                    setDifficulty(e.target.value);
                                    trackEvent('difficulty_filter_apply', e.target.value);
                                }, children: [_jsx("option", { value: "all", children: "Todas" }), _jsx("option", { value: "F\u00E1cil", children: "F\u00E1cil" }), _jsx("option", { value: "M\u00E9dio", children: "M\u00E9dio" }), _jsx("option", { value: "Dif\u00EDcil", children: "Dif\u00EDcil" })] })] }), "return ( // ...", _jsxs("div", { className: "relative", children: [_jsx("label", { htmlFor: "busca", className: "sr-only", children: "Buscar por t\u00EDtulo" }), _jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted", size: 18, "aria-hidden": true }), _jsx("input", { id: "busca", type: "search", className: "input pl-10 pr-10", placeholder: "Buscar por t\u00EDtulo ou ingredientes", value: q, onChange: (e) => setQ(e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter') {
                                        saveSearch(q);
                                        trackEvent('search_perform', q);
                                    }
                                } }), isListening && _jsx(RecordingWaveform, {}), _jsx("button", { type: "button", className: `absolute right-3 top-1/2 -translate-y-1/2 ${isListening ? 'text-red-500' : 'text-muted'} hover:text-terracotta`, onClick: () => {
                                    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                    if (SpeechRecognition) {
                                        const recognition = new SpeechRecognition();
                                        recognition.lang = 'pt-BR';
                                        recognition.onstart = () => setIsListening(true);
                                        recognition.onend = () => setIsListening(false);
                                        recognition.onresult = (event) => { setQ(event.results[0][0].transcript); saveSearch(event.results[0][0].transcript); };
                                        recognition.start();
                                    }
                                }, "aria-label": "Pesquisar por voz", children: _jsx(Mic, { size: 18, "aria-hidden": true }) }), recentSearches.length > 0 && (_jsx("div", { className: "absolute w-full bg-white border border-ink/10 rounded-xl mt-1 shadow-md z-20", children: recentSearches.map(s => _jsx("button", { className: "block w-full text-left p-2 hover:bg-sand", onClick: () => { setQ(s); saveSearch(s); }, children: s }, s)) }))] }), loading ? _jsx(Spinner, {}) : error ? (_jsx("p", { role: "alert", className: "rounded-lg bg-red-50 p-3 text-sm text-red-800", children: error })) : visible.length === 0 ? (_jsxs("div", { className: "card text-center", children: [_jsxs("p", { className: "font-medium", children: ["Nada encontrado para \u201C", q, "\u201D."] }), suggestions && (_jsxs("button", { className: "text-terracotta hover:underline block w-full mt-2", onClick: () => setQ(suggestions), children: ["Voc\u00EA quis dizer \u201C", suggestions, "\u201D?"] })), _jsx("button", { className: "btn-secondary mt-3", onClick: () => setQ(""), children: "Limpar busca" })] })) : (_jsx("ul", { className: "grid gap-3 sm:grid-cols-2", children: visible.map((i) => _jsx("li", { children: _jsx(ItemCard, { item: i, locked: !isPremium }) }, i.id)) }))] }), _jsx("aside", { children: _jsx(CommunityFeed, {}) })] }));
}
