import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Heart, TriangleAlert, Star, Printer, Share2, FileDown, MessageCircle, Facebook, Instagram, Mic } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABEL, SAFETY_TEXT, type Item } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/Spinner";
import { KitchenTimer } from "@/components/KitchenTimer";
import { NutritionFacts } from "@/components/NutritionFacts";
import { PrintPreview } from "@/components/PrintPreview";
import { AddToCollectionModal } from "@/components/AddToCollectionModal";
import { CollectionModal } from "@/components/CollectionModal";
import { ConversionModal } from "@/components/ConversionModal";
import { SEO } from "@/components/SEO";
import { trackEvent } from "@/lib/analytics";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
      <span className="font-bold">Média: {avg.toFixed(1)}</span>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} onClick={() => rate(i)} className={i <= (rating || 0) ? "text-yellow-500" : "text-gray-300"}>
          <Star size={20} fill={i <= (rating || 0) ? "currentColor" : "none"} />
        </button>
      ))}
    </div>
  );
}

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [ack, setAck] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nutrition, setNutrition] = useState<any>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState('');
  const [showPrint, setShowPrint] = useState(false);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [showConversion, setShowConversion] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isListeningSteps, setIsListeningSteps] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isListeningSteps) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    const rec = new SpeechRecognition();
    rec.lang = 'pt-BR';
    rec.continuous = true;
    rec.onresult = (e: any) => {
      const cmd = e.results[e.results.length - 1][0].transcript.toLowerCase();
      if (cmd.includes('próximo')) setCurrentStep(s => Math.min(s + 1, (item?.steps?.length || 1) - 1));
      if (cmd.includes('anterior')) setCurrentStep(s => Math.max(s - 1, 0));
      if (cmd.includes('repetir')) {
        const msg = new SpeechSynthesisUtterance(item?.steps[currentStep] || '');
        msg.lang = 'pt-BR';
        window.speechSynthesis.speak(msg);
      }
    };
    rec.start();
    return () => rec.stop();
  }, [isListeningSteps, item, currentStep]);

  const handleCreateCollection = async (name: string) => {
    if (!user || !item) return;
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
    setLoading(true); setAck(false);
    (async () => {
      const { data, error: e } = await supabase.from("items").select("*").eq("id", id ?? "").maybeSingle();
      if (!alive) return;
      if (e) setError("Não foi possível carregar este item.");
      setItem((data as Item | null) ?? null);
      if (data) {
        setServings(parseInt((data as Item).servings || '1'));
        trackEvent('recipe_view', (data as Item).title);
      }
      
      if (user && data) {
        const f = await supabase.from("favorites").select("item_id").eq("user_id", user.id).eq("item_id", id ?? "").maybeSingle();
        if (alive) setFav(Boolean(f.data));
        const n = await supabase.from('user_recipe_notes').select('note').eq('item_id', data.id).eq('user_id', user.id).maybeSingle();
        if (n.data) setNotes(n.data.note);
      }
      if (alive) setLoading(false);
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
    } else if (item?.nutrition) {
      setNutrition(item.nutrition);
    }
  }, [item]);

  const multiplier = servings / (item ? parseInt(item.servings || '1') : 1);
  const scaleIngredient = (ing: string) => ing.replace(/(\d+(\.\d+)?)/g, (match) => (parseFloat(match) * multiplier).toFixed(1).replace(/\.0$/, ''));

  async function exportToPDF() {
    const element = contentRef.current;
    if (!element) return;
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
    if (!user || !item) return;
    setFavBusy(true);
    const { error: e } = fav
      ? await supabase.from("favorites").delete().eq("user_id", user.id).eq("item_id", item.id)
      : await supabase.from("favorites").insert({ user_id: user.id, item_id: item.id });
    setFavBusy(false);
    if (e) setError("Não foi possível atualizar os favoritos."); else { setFav(!fav); setError(null); }
  }

  const saveNote = async () => {
    if (!user || !item) return;
    await supabase.from('user_recipe_notes').upsert({ item_id: item.id, user_id: user.id, note: notes });
    alert('Nota salva!');
  };

  const handlePrint = (sections: any) => {
    setShowPrint(false);
    setTimeout(() => window.print(), 100);
  };

  if (loading) return <Spinner />;
  if (!item) return <div className="card text-center"><p className="font-medium">Item não encontrado.</p></div>;

  const needsAck = item.safety && !ack;

  return (
    <article className="space-y-6" ref={contentRef}>
      <SEO title={item.title} description={item.summary || item.title} />
      {showPrint && <PrintPreview onClose={() => setShowPrint(false)} onPrint={handlePrint} />}
      {item && <AddToCollectionModal isOpen={showAddToCollection} onClose={() => setShowAddToCollection(false)} itemId={item.id} />}
      <div className="fixed top-0 left-0 h-1 bg-terracotta z-50" style={{ width: `${scrollProgress}%` }} />
      <Link to="/" className="inline-flex min-h-[44px] items-center gap-1 text-sm text-terracotta-dark"><ArrowLeft size={16} aria-hidden /> Voltar</Link>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-terracotta-dark">{CATEGORY_LABEL[item.category]}</p>
        <div className="flex items-start justify-between gap-3 no-print">
          <h1 className="text-3xl font-bold">{item.title}</h1>
          {item.verified && <span className="text-sky-800 bg-sky-100 px-2 py-1 rounded-full text-xs font-bold">✓ Verificada pela Comunidade</span>}
          <button onClick={toggleFav} disabled={favBusy} aria-pressed={fav} aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"} className="btn-secondary shrink-0">
            <Heart size={18} aria-hidden className={fav ? "fill-terracotta text-terracotta" : ""} />
          </button>
          <button onClick={() => setShowAddToCollection(true)} className="btn-secondary shrink-0" aria-label="Adicionar à coleção">
            + Coleção
          </button>
          <button onClick={() => setShowCreateCollection(true)} className="btn-secondary shrink-0" aria-label="Criar nova coleção">
            Nova Coleção
          </button>
          <CollectionModal isOpen={showCreateCollection} onClose={() => setShowCreateCollection(false)} onSave={handleCreateCollection} />
          <button onClick={exportToPDF} className="btn-secondary shrink-0" aria-label="Exportar para PDF"><FileDown size={18} aria-hidden /></button>
          <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(item.title + ': ' + window.location.href)}`, '_blank')} className="btn-secondary shrink-0" aria-label="Compartilhar no WhatsApp">
            <MessageCircle size={18} aria-hidden />
          </button>
          <button onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ title: item.title, url: window.location.href });
              } catch (err) { console.error('Share failed', err); }
            } else {
              window.navigator.clipboard.writeText(window.location.href);
              alert('Link copiado!');
            }
          }} className="btn-secondary shrink-0" aria-label="Compartilhar receita"><Share2 size={18} aria-hidden /></button>
          <button onClick={() => setShowPrint(true)} className="btn-secondary shrink-0" aria-label="Imprimir receita"><Printer size={18} aria-hidden /></button>
          <button 
            onClick={() => setIsListeningSteps(!isListeningSteps)} 
            className={`btn-secondary shrink-0 ${isListeningSteps ? 'bg-emerald-100 text-emerald-700 border-emerald-500' : ''}`}
            aria-label="Modo mãos livres"
          >
            <Mic size={18} className={isListeningSteps ? 'animate-pulse' : ''} />
          </button>
        </div>
        <RatingSection itemId={item.id} />
        <div className="flex items-center gap-4 text-sm text-muted">
            {item.level && <DifficultyBadge level={item.level} />}
            <span>{item.time}</span>
            <div className="flex items-center gap-2">
                <span>Porções:</span>
                <input type="number" className="w-16 input" value={servings} onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))} />
            </div>
        </div>
        {nutrition && (
          <section className="card bg-sand border-terracotta/20">
            <h3 className="font-bold mb-4">Distribuição de Macronutrientes</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Proteína', value: parseFloat(nutrition.protein || nutrition.prot || 0) },
                      { name: 'Gorduras', value: parseFloat(nutrition.fats || nutrition.fat || 0) },
                      { name: 'Carboidratos', value: parseFloat(nutrition.carbs || nutrition.carb || 0) },
                    ]}
                    cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label
                  >
                    <Cell fill="#e11d48" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#10b981" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
      </header>
      
      {isListeningSteps && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-[60] animate-bounce">
          <Mic size={20} />
          <span className="font-bold">Ouvindo comandos...</span>
        </div>
      )}
      
      {item.ingredients.length > 0 && (
        <section aria-labelledby="ing" className="space-y-3">
          <h2 id="ing" className="text-xl font-bold">Ingredientes</h2>
          <ul className="space-y-2">
            {item.ingredients.map((x, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg border border-ink/10 p-2 text-sm">
                <input type="checkbox" onChange={(e) => {
                    const ing = scaleIngredient(x);
                    // Simplified selection logic
                }} />
                <span>{scaleIngredient(x)}</span>
              </li>
            ))}
          </ul>
          <button className="btn-primary" onClick={async () => { /* Add logic */ alert('Adicionado à lista!'); }}>Adicionar Selecionados</button>
        </section>
      )}

      <section className="card space-y-2">
        <h2 className="text-lg font-bold">Notas Pessoais</h2>
        <textarea className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Adicione dicas ou modificações..." />
        <button className="btn-primary" onClick={saveNote}>Salvar Nota</button>
      </section>

      <div className="flex justify-center gap-4 py-4">
        {['❤️', '🔥', '👍'].map(r => (
            <button key={r} onClick={async () => {
                if(!user) return;
                await supabase.from('recipe_reactions').insert({ item_id: item.id, user_id: user.id, reaction: r });
                alert(`Reação ${r} enviada!`);
            }} className="text-2xl hover:scale-125 transition-transform">{r}</button>
        ))}
      </div>

      <div className="flex justify-center">
        <button onClick={async () => {
          const reason = prompt("Por que deseja denunciar esta receita?");
          if (reason) {
            await supabase.from('reports').insert({ item_id: item.id, user_id: user?.id, reason });
            alert("Denúncia enviada!");
          }
        }} className="text-sm text-red-600 hover:underline">
          Denunciar Receita
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <p className="text-sm font-semibold">Compartilhe nas redes:</p>
        <div className="flex gap-4">
          <a href={`https://wa.me/?text=${window.location.href}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no WhatsApp"><MessageCircle size={24} className="text-emerald-500" /></a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" aria-label="Compartilhar no Facebook"><Facebook size={24} className="text-blue-600" /></a>
          <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" aria-label="Visitar Instagram"><Instagram size={24} className="text-pink-600" /></a>
        </div>
      </div>
    </article>
  );
}
