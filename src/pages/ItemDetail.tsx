import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Heart, Star, Printer, Share2, FileDown, MessageCircle, Facebook, Instagram, Mic, Volume2, FastForward, Play } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABEL, type Item } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { usePace } from "@/context/PaceContext";
import { Spinner } from "@/components/Spinner";
import { KitchenTimer } from "@/components/KitchenTimer";
import { PrintPreview } from "@/components/PrintPreview";
import { AddToCollectionModal } from "@/components/AddToCollectionModal";
import { CollectionModal } from "@/components/CollectionModal";
import { SocialShareModal } from "@/components/SocialShareModal";
import { SEO } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/DifficultyBadge";

function RatingSection({ itemId }: { itemId: string }) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    supabase.from("ratings").select("rating").eq("item_id", itemId).then(({ data }) => {
      if (data && data.length > 0) {
        setAvg(data.reduce((a, b) => a + b.rating, 0) / data.length);
      }
    });
    if (user) {
      supabase.from("ratings").select("rating").eq("item_id", itemId).eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data) setRating(data.rating);
      });
    }
  }, [itemId, user]);

  async function rate(r: number) {
    if (!user) return;
    const { error } = await supabase.from("ratings").upsert({ item_id: itemId, user_id: user.id, rating: r });
    if (!error) setRating(r);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-bold text-sm">Média: {avg.toFixed(1)}</span>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} onClick={() => rate(i)} className={i <= (rating || 0) ? "text-yellow-500" : "text-gray-300"}>
          <Star size={18} fill={i <= (rating || 0) ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { pace, speechRate } = usePace();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [nutrition, setNutrition] = useState<any>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showSocialShare, setShowSocialShare] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [isListeningSteps, setIsListeningSteps] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const speakStepText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = speechRate; // Applied from PaceContext (0.8x, 1.0x, 1.25x)
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (!isListeningSteps) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.onresult = (e: any) => {
      const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (cmd.includes("próximo") || cmd.includes("avançar")) {
        setCurrentStep((s) => {
          const next = Math.min(s + 1, (item?.steps?.length || 1) - 1);
          if (item?.steps[next]) speakStepText(item.steps[next]);
          return next;
        });
      }
      if (cmd.includes("anterior") || cmd.includes("voltar")) {
        setCurrentStep((s) => {
          const prev = Math.max(s - 1, 0);
          if (item?.steps[prev]) speakStepText(item.steps[prev]);
          return prev;
        });
      }
      if (cmd.includes("repetir") || cmd.includes("ler")) {
        if (item?.steps[currentStep]) speakStepText(item.steps[currentStep]);
      }
    };
    rec.start();
    return () => rec.stop();
  }, [isListeningSteps, item, currentStep, speechRate]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((window.scrollY / totalHeight) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const { data, error: e } = await supabase.from("items").select("*").eq("id", id ?? "").maybeSingle();
      if (!alive) return;
      setItem((data as Item | null) ?? null);
      if (data) {
        setServings(parseInt((data as Item).servings || "1"));
        trackEvent("recipe_view", (data as Item).title);
      }

      if (user && data) {
        const f = await supabase.from("favorites").select("item_id").eq("user_id", user.id).eq("item_id", id ?? "").maybeSingle();
        if (alive) setFav(Boolean(f.data));
        const n = await supabase.from("user_recipe_notes").select("note").eq("item_id", data.id).eq("user_id", user.id).maybeSingle();
        if (n.data) setNotes(n.data.note);
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id, user]);

  useEffect(() => {
    if (item && !item.nutrition && item.ingredients?.length > 0) {
      fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: item.ingredients }),
      })
        .then((res) => res.json())
        .then((data) => setNutrition(data))
        .catch(console.error);
    } else if (item?.nutrition) {
      setNutrition(item.nutrition);
    }
  }, [item]);

  const multiplier = servings / (item ? parseInt(item.servings || "1") : 1);
  const scaleIngredient = (ing: string) =>
    ing.replace(/(\d+(\.\d+)?)/g, (match) => (parseFloat(match) * multiplier).toFixed(1).replace(/\.0$/, ""));

  async function exportToPDF() {
    const element = contentRef.current;
    if (!element) return;
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const canvas = await html2canvas(element, {
      scale: 2,
      ignoreElements: (el) => el.classList.contains("no-print") || el.tagName === "BUTTON" || el.tagName === "NAV",
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
    if (!user || !item) return;
    setFavBusy(true);
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("item_id", item.id);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, item_id: item.id });
    }
    setFavBusy(false);
    setFav(!fav);
  }

  const saveNote = async () => {
    if (!user || !item) return;
    await supabase.from("user_recipe_notes").upsert({ item_id: item.id, user_id: user.id, note: notes });
    alert("Nota salva com sucesso!");
  };

  const handleAddToShoppingList = () => {
    if (!item) return;
    const saved = localStorage.getItem("shopping_list_local");
    let currentList = saved ? JSON.parse(saved) : [];

    item.ingredients.forEach((ing) => {
      currentList.push({
        id: Date.now() + Math.random(),
        ingredient: scaleIngredient(ing),
        checked: false,
      });
    });

    localStorage.setItem("shopping_list_local", JSON.stringify(currentList));
    alert("Ingredientes adicionados à Lista de Compras!");
  };

  if (loading) return <Spinner />;
  if (!item) return <div className="card text-center"><p className="font-medium">Item não encontrado.</p></div>;

  return (
    <article className="space-y-6 max-w-4xl mx-auto" ref={contentRef}>
      <SEO
        title={item.title}
        description={item.summary || `Aprenda a fazer ${item.title} com o passo a passo completo no Caderno de Receitas.`}
        recipe={{
          name: item.title,
          description: item.summary || item.title,
          prepTime: item.time,
          servings: servings,
          ingredients: item.ingredients,
          steps: item.steps,
          category: CATEGORY_LABEL[item.category] || item.category,
        }}
      />
      {showPrint && <PrintPreview onClose={() => setShowPrint(false)} onPrint={() => { setShowPrint(false); window.print(); }} />}
      {item && <AddToCollectionModal isOpen={showAddToCollection} onClose={() => setShowAddToCollection(false)} itemId={item.id} />}
      {item && <SocialShareModal isOpen={showSocialShare} onClose={() => setShowSocialShare(false)} item={item} />}
      <div className="fixed top-0 left-0 h-1 bg-terracotta z-50 transition-all duration-150" style={{ width: `${scrollProgress}%` }} />

      <Link to="/" className="inline-flex min-h-[44px] items-center gap-1 text-sm text-terracotta-dark font-medium">
        <ArrowLeft size={16} aria-hidden /> Voltar ao Catálogo
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
            {CATEGORY_LABEL[item.category] || item.category}
          </span>
          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
            Ritmo de Cozinha: <strong>{pace.toUpperCase()}</strong> ({speechRate}x)
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 no-print">
          <h1 className="text-3xl font-bold text-slate-900">{item.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={toggleFav} disabled={favBusy} className="btn-secondary shrink-0" title="Favoritar">
              <Heart size={18} className={fav ? "fill-terracotta text-terracotta" : ""} />
            </button>
            <button onClick={() => setShowAddToCollection(true)} className="btn-secondary text-xs shrink-0">
              + Coleção
            </button>
            <button
              onClick={() => setShowSocialShare(true)}
              className="btn-secondary text-xs shrink-0 flex items-center gap-1.5 font-bold text-terracotta border-terracotta/30 bg-sand/40 hover:bg-sand"
              title="Gerar Card & Compartilhar (Instagram / WhatsApp)"
            >
              <Share2 size={16} /> Compartilhar
            </button>
            <button onClick={exportToPDF} className="btn-secondary shrink-0" title="Exportar PDF">
              <FileDown size={18} />
            </button>
            <button onClick={() => setShowPrint(true)} className="btn-secondary shrink-0" title="Imprimir">
              <Printer size={18} />
            </button>
            <button
              onClick={() => setIsListeningSteps(!isListeningSteps)}
              className={`btn-primary text-xs shrink-0 flex items-center gap-1.5 ${isListeningSteps ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
            >
              <Mic size={16} className={isListeningSteps ? "animate-pulse" : ""} />
              {isListeningSteps ? "Voz Ativa" : "Modo Mãos Livres"}
            </button>
          </div>
        </div>

        <RatingSection itemId={item.id} />

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted pt-1 border-t">
          {item.level && <DifficultyBadge level={item.level} />}
          {item.time && <span>Preparo: {item.time}</span>}
          <div className="flex items-center gap-2">
            <span>Rendimento (Porções):</span>
            <input
              type="number"
              min="1"
              max="50"
              className="w-16 input text-xs"
              value={servings}
              onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
        </div>
      </header>

      {/* Hands-Free Step Voice Player */}
      {isListeningSteps && (
        <div className="card border-emerald-300 bg-emerald-50/90 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <Mic size={18} className="text-emerald-600 animate-pulse" />
              <span>Modo Mãos Livres Ativado (Ritmo: {pace} - {speechRate}x)</span>
            </div>
            <button
              onClick={() => speakStepText(item.steps?.[currentStep] || "")}
              className="btn-secondary text-xs flex items-center gap-1 bg-white"
            >
              <Volume2 size={14} />
              Ouvir Passo
            </button>
          </div>
          <p className="text-xs text-emerald-800">
            Fale <strong>"Próximo"</strong>, <strong>"Anterior"</strong> ou <strong>"Repetir"</strong> para avançar nas instruções sem tocar na tela.
          </p>
        </div>
      )}

      {/* Ingredients List */}
      {item.ingredients?.length > 0 && (
        <section className="card p-5 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-bold text-slate-900">Ingredientes</h2>
            <button onClick={handleAddToShoppingList} className="btn-primary text-xs">
              + Adicionar Todos à Lista de Compras
            </button>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {item.ingredients.map((x, i) => (
              <li key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 bg-white text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
                <span>{scaleIngredient(x)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Step by Step Navigation */}
      {item.steps?.length > 0 && (
        <section className="card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-bold text-slate-900">Modo de Preparo</h2>
            <span className="text-xs text-muted font-medium">
              Passo {currentStep + 1} de {item.steps.length}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-sand/60 border border-slate-200 space-y-2">
            <p className="text-base leading-relaxed text-slate-800 font-medium">
              {item.steps[currentStep]}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                const prev = Math.max(0, currentStep - 1);
                setCurrentStep(prev);
                speakStepText(item.steps[prev]);
              }}
              disabled={currentStep === 0}
              className="btn-secondary text-xs disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              onClick={() => speakStepText(item.steps[currentStep])}
              className="btn-secondary text-xs flex items-center gap-1"
            >
              <Volume2 size={14} />
              Ler Passo ({speechRate}x)
            </button>

            <button
              onClick={() => {
                const next = Math.min(item.steps.length - 1, currentStep + 1);
                setCurrentStep(next);
                speakStepText(item.steps[next]);
              }}
              disabled={currentStep === item.steps.length - 1}
              className="btn-primary text-xs disabled:opacity-50"
            >
              Próximo Passo
            </button>
          </div>
        </section>
      )}

      {/* Kitchen Timer Component */}
      <KitchenTimer />

      {/* Personal Notes */}
      <section className="card p-4 space-y-3">
        <h2 className="text-base font-bold text-slate-800">Minhas Anotações de Culinária</h2>
        <textarea
          className="input text-xs min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione suas próprias modificações, substituições ou dicas..."
        />
        <button className="btn-primary text-xs" onClick={saveNote}>
          Salvar Anotação
        </button>
      </section>
    </article>
  );
}
