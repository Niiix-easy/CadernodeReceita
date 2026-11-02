import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Star, Printer, Share2, FileDown, MessageCircle, Facebook, Instagram, Mic } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABEL } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/Spinner";
import { PrintPreview } from "@/components/PrintPreview";
import { AddToCollectionModal } from "@/components/AddToCollectionModal";
import { CollectionModal } from "@/components/CollectionModal";
import { SEO } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
function RatingSection({ itemId }) {
    const { user } = useAuth();
    const [rating, setRating] = useState(null);
    const [avg, setAvg] = useState(0);
    useEffect(() => {
        supabase.from("ratings").select("rating").eq("item_id", itemId).then(({ data }) => {
            if (data && data.length > 0) {
                setAvg(data.reduce((a, b) => a + b.rating, 0) / data.length);
            }
        });
        if (user) {
            supabase.from("ratings").select("rating").eq("item_id", itemId).eq("user_id", user.id).maybeSingle().then(({ data }) => {
                if (data)
                    setRating(data.rating);
            });
        }
    }, [itemId, user]);
    async function rate(r) {
        if (!user)
            return;
        const { error } = await supabase.from("ratings").upsert({ item_id: itemId, user_id: user.id, rating: r });
        if (!error)
            setRating(r);
    }
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "font-bold", children: ["M\u00E9dia: ", avg.toFixed(1)] }), [1, 2, 3, 4, 5].map((i) => (_jsx("button", { onClick: () => rate(i), className: i <= (rating || 0) ? "text-yellow-500" : "text-gray-300", children: _jsx(Star, { size: 20, fill: i <= (rating || 0) ? "currentColor" : "none" }) }, i)))] }));
}
export default function ItemDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fav, setFav] = useState(false);
    const [favBusy, setFavBusy] = useState(false);
    const [ack, setAck] = useState(false);
    const [error, setError] = useState(null);
    const [nutrition, setNutrition] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [servings, setServings] = useState(1);
    const [notes, setNotes] = useState('');
    const [showPrint, setShowPrint] = useState(false);
    const [showAddToCollection, setShowAddToCollection] = useState(false);
    const [showCreateCollection, setShowCreateCollection] = useState(false);
    const [showConversion, setShowConversion] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [isListeningSteps, setIsListeningSteps] = useState(false);
    const contentRef = useRef(null);
    useEffect(() => {
        if (!isListeningSteps)
            return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition)
            return;
        const rec = new SpeechRecognition();
        rec.lang = 'pt-BR';
        rec.continuous = true;
        rec.onresult = (e) => {
            const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
            if (cmd.includes('próximo'))
                setCurrentStep(s => Math.min(s + 1, (item?.steps?.length || 1) - 1));
            if (cmd.includes('anterior'))
                setCurrentStep(s => Math.max(s - 1, 0));
            if (cmd.includes('repetir')) {
                const msg = new SpeechSynthesisUtterance(item?.steps[currentStep] || '');
                msg.lang = 'pt-BR';
                window.speechSynthesis.speak(msg);
            }
        };
        rec.start();
        return () => rec.stop();
    }, [isListeningSteps, item, currentStep]);
    const handleCreateCollection = async (name) => {
        if (!user || !item)
            return;
        const { data, error } = await supabase.from('user_collections').insert({ user_id: user.id, name }).select().single();
        if (data) {
            await supabase.from('collection_items').insert({ collection_id: data.id, item_id: item.id });
            alert(`Coleção "${name}" criada e receita adicionada!`);
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setScrollProgress((window.scrollY / totalHeight) * 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setAck(false);
        (async () => {
            const { data, error: e } = await supabase.from("items").select("*").eq("id", id ?? "").maybeSingle();
            if (!alive)
                return;
            if (e)
                setError("Não foi possível carregar este item.");
            setItem(data ?? null);
            if (data) {
                setServings(parseInt(data.servings || '1'));
                trackEvent('recipe_view', data.title);
            }
            if (user && data) {
                const f = await supabase.from("favorites").select("item_id").eq("user_id", user.id).eq("item_id", id ?? "").maybeSingle();
                if (alive)
                    setFav(Boolean(f.data));
                const n = await supabase.from('user_recipe_notes').select('note').eq('item_id', data.id).eq('user_id', user.id).maybeSingle();
                if (n.data)
                    setNotes(n.data.note);
            }
            if (alive)
                setLoading(false);
        })();
        return () => { alive = false; };
    }, [id, user]);
    useEffect(() => {
        if (item && !item.nutrition && item.ingredients.length > 0) {
            fetch('/api/nutrition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredients: item.ingredients })
            })
                .then(res => res.json())
                .then(data => setNutrition(data))
                .catch(console.error);
        }
        else if (item?.nutrition) {
            setNutrition(item.nutrition);
        }
    }, [item]);
    const multiplier = servings / (item ? parseInt(item.servings || '1') : 1);
    const scaleIngredient = (ing) => ing.replace(/(\d+(\.\d+)?)/g, (match) => (parseFloat(match) * multiplier).toFixed(1).replace(/\.0$/, ''));
    async function exportToPDF() {
        const element = contentRef.current;
        if (!element)
            return;
        const canvas = await html2canvas(element, {
            scale: 2,
            ignoreElements: (el) => el.classList.contains('no-print') || el.tagName === 'BUTTON' || el.tagName === 'NAV'
        });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${item?.title || "receita"}.pdf`);
    }
    async function toggleFav() {
        if (!user || !item)
            return;
        setFavBusy(true);
        const { error: e } = fav
            ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("item_id", item.id)
            : await supabase.from("favorites").insert({ user_id: user.id, item_id: item.id });
        setFavBusy(false);
        if (e)
            setError("Não foi possível atualizar os favoritos.");
        else {
            setFav(!fav);
            setError(null);
        }
    }
    const saveNote = async () => {
        if (!user || !item)
            return;
        await supabase.from('user_recipe_notes').upsert({ item_id: item.id, user_id: user.id, note: notes });
        alert('Nota salva!');
    };
    const handlePrint = (sections) => {
        setShowPrint(false);
        setTimeout(() => window.print(), 100);
    };
    if (loading)
        return _jsx(Spinner, {});
    if (!item)
        return _jsx("div", { className: "card text-center", children: _jsx("p", { className: "font-medium", children: "Item n\u00E3o encontrado." }) });
    const needsAck = item.safety && !ack;
    return (_jsxs("article", { className: "space-y-6", ref: contentRef, children: [_jsx(SEO, { title: item.title, description: item.summary || item.title }), showPrint && _jsx(PrintPreview, { onClose: () => setShowPrint(false), onPrint: handlePrint }), item && _jsx(AddToCollectionModal, { isOpen: showAddToCollection, onClose: () => setShowAddToCollection(false), itemId: item.id }), _jsx("div", { className: "fixed top-0 left-0 h-1 bg-terracotta z-50", style: { width: `${scrollProgress}%` } }), _jsxs(Link, { to: "/", className: "inline-flex min-h-[44px] items-center gap-1 text-sm text-terracotta-dark", children: [_jsx(ArrowLeft, { size: 16, "aria-hidden": true }), " Voltar"] }), _jsxs("header", { className: "space-y-2", children: [_jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-terracotta-dark", children: CATEGORY_LABEL[item.category] }), _jsxs("div", { className: "flex items-start justify-between gap-3 no-print", children: [_jsx("h1", { className: "text-3xl font-bold", children: item.title }), item.verified && _jsx("span", { className: "text-sky-800 bg-sky-100 px-2 py-1 rounded-full text-xs font-bold", children: "\u2713 Verificada pela Comunidade" }), _jsx("button", { onClick: toggleFav, disabled: favBusy, "aria-pressed": fav, "aria-label": fav ? "Remover dos favoritos" : "Adicionar aos favoritos", className: "btn-secondary shrink-0", children: _jsx(Heart, { size: 18, "aria-hidden": true, className: fav ? "fill-terracotta text-terracotta" : "" }) }), _jsx("button", { onClick: () => setShowAddToCollection(true), className: "btn-secondary shrink-0", "aria-label": "Adicionar \u00E0 cole\u00E7\u00E3o", children: "+ Cole\u00E7\u00E3o" }), _jsx("button", { onClick: () => setShowCreateCollection(true), className: "btn-secondary shrink-0", "aria-label": "Criar nova cole\u00E7\u00E3o", children: "Nova Cole\u00E7\u00E3o" }), _jsx(CollectionModal, { isOpen: showCreateCollection, onClose: () => setShowCreateCollection(false), onSave: handleCreateCollection }), _jsx("button", { onClick: exportToPDF, className: "btn-secondary shrink-0", "aria-label": "Exportar para PDF", children: _jsx(FileDown, { size: 18, "aria-hidden": true }) }), _jsx("button", { onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(item.title + ': ' + window.location.href)}`, '_blank'), className: "btn-secondary shrink-0", "aria-label": "Compartilhar no WhatsApp", children: _jsx(MessageCircle, { size: 18, "aria-hidden": true }) }), _jsx("button", { onClick: async () => {
                                    if (navigator.share) {
                                        try {
                                            await navigator.share({ title: item.title, url: window.location.href });
                                        }
                                        catch (err) {
                                            console.error('Share failed', err);
                                        }
                                    }
                                    else {
                                        window.navigator.clipboard.writeText(window.location.href);
                                        alert('Link copiado!');
                                    }
                                }, className: "btn-secondary shrink-0", "aria-label": "Compartilhar receita", children: _jsx(Share2, { size: 18, "aria-hidden": true }) }), _jsx("button", { onClick: () => setShowPrint(true), className: "btn-secondary shrink-0", "aria-label": "Imprimir receita", children: _jsx(Printer, { size: 18, "aria-hidden": true }) }), _jsx("button", { onClick: () => setIsListeningSteps(!isListeningSteps), className: `btn-secondary shrink-0 ${isListeningSteps ? 'bg-emerald-100 text-emerald-700 border-emerald-500' : ''}`, "aria-label": "Modo m\u00E3os livres", children: _jsx(Mic, { size: 18, className: isListeningSteps ? 'animate-pulse' : '' }) })] }), _jsx(RatingSection, { itemId: item.id }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-muted", children: [item.level && _jsx(DifficultyBadge, { level: item.level }), _jsx("span", { children: item.time }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { children: "Por\u00E7\u00F5es:" }), _jsx("input", { type: "number", className: "w-16 input", value: servings, onChange: (e) => setServings(Math.max(1, parseInt(e.target.value) || 1)) })] })] }), nutrition && (_jsxs("section", { className: "card bg-sand border-terracotta/20", children: [_jsx("h3", { className: "font-bold mb-4", children: "Distribui\u00E7\u00E3o de Macronutrientes" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(PieChart, { children: [_jsxs(Pie, { data: [
                                                    { name: 'Proteína', value: parseFloat(nutrition.protein || nutrition.prot || 0) },
                                                    { name: 'Gorduras', value: parseFloat(nutrition.fats || nutrition.fat || 0) },
                                                    { name: 'Carboidratos', value: parseFloat(nutrition.carbs || nutrition.carb || 0) },
                                                ], cx: "50%", cy: "50%", outerRadius: 80, fill: "#8884d8", dataKey: "value", label: true, children: [_jsx(Cell, { fill: "#e11d48" }), _jsx(Cell, { fill: "#f59e0b" }), _jsx(Cell, { fill: "#10b981" })] }), _jsx(Tooltip, {})] }) }) })] }))] }), isListeningSteps && (_jsxs("div", { className: "fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-[60] animate-bounce", children: [_jsx(Mic, { size: 20 }), _jsx("span", { className: "font-bold", children: "Ouvindo comandos..." })] })), item.ingredients.length > 0 && (_jsxs("section", { "aria-labelledby": "ing", className: "space-y-3", children: [_jsx("h2", { id: "ing", className: "text-xl font-bold", children: "Ingredientes" }), _jsx("ul", { className: "space-y-2", children: item.ingredients.map((x, i) => (_jsxs("li", { className: "flex items-center gap-2 rounded-lg border border-ink/10 p-2 text-sm", children: [_jsx("input", { type: "checkbox", onChange: (e) => {
                                        const ing = scaleIngredient(x);
                                        // Simplified selection logic
                                    } }), _jsx("span", { children: scaleIngredient(x) })] }, i))) }), _jsx("button", { className: "btn-primary", onClick: async () => { /* Add logic */ alert('Adicionado à lista!'); }, children: "Adicionar Selecionados" })] })), _jsxs("section", { className: "card space-y-2", children: [_jsx("h2", { className: "text-lg font-bold", children: "Notas Pessoais" }), _jsx("textarea", { className: "input", value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Adicione dicas ou modifica\u00E7\u00F5es..." }), _jsx("button", { className: "btn-primary", onClick: saveNote, children: "Salvar Nota" })] }), _jsx("div", { className: "flex justify-center gap-4 py-4", children: ['❤️', '🔥', '👍'].map(r => (_jsx("button", { onClick: async () => {
                        if (!user)
                            return;
                        await supabase.from('recipe_reactions').insert({ item_id: item.id, user_id: user.id, reaction: r });
                        alert(`Reação ${r} enviada!`);
                    }, className: "text-2xl hover:scale-125 transition-transform", children: r }, r))) }), _jsx("div", { className: "flex justify-center", children: _jsx("button", { onClick: async () => {
                        const reason = prompt("Por que deseja denunciar esta receita?");
                        if (reason) {
                            await supabase.from('reports').insert({ item_id: item.id, user_id: user?.id, reason });
                            alert("Denúncia enviada!");
                        }
                    }, className: "text-sm text-red-600 hover:underline", children: "Denunciar Receita" }) }), _jsxs("div", { className: "flex flex-col items-center gap-4 py-4", children: [_jsx("p", { className: "text-sm font-semibold", children: "Compartilhe nas redes:" }), _jsxs("div", { className: "flex gap-4", children: [_jsx("a", { href: `https://wa.me/?text=${window.location.href}`, target: "_blank", rel: "noopener noreferrer", "aria-label": "Compartilhar no WhatsApp", children: _jsx(MessageCircle, { size: 24, className: "text-emerald-500" }) }), _jsx("a", { href: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, target: "_blank", rel: "noopener noreferrer", "aria-label": "Compartilhar no Facebook", children: _jsx(Facebook, { size: 24, className: "text-blue-600" }) }), _jsx("a", { href: `https://www.instagram.com/`, target: "_blank", rel: "noopener noreferrer", "aria-label": "Visitar Instagram", children: _jsx(Instagram, { size: 24, className: "text-pink-600" }) })] })] })] }));
}
