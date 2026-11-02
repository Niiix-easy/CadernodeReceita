import React, { useRef, useState } from "react";
import { Share2, Download, Copy, Check, Send, Sparkles, X, Image as ImageIcon, Smartphone } from "lucide-react";
import type { CatalogItem } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CatalogItem & { nutrition?: any };
}

type AspectRatioPreset = "1.91:1" | "1:1" | "9:16";

export const SocialShareModal: React.FC<SocialShareModalProps> = ({ isOpen, onClose, item }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioPreset>("1.91:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !item) return null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = ` Confira essa receita incrível de "${item.title}" no Caderno de Receitas!\n⏱ Tempo: ${item.time || "20-30 min"} | Nível: ${item.level || "Fácil"}\n👉 Veja os ingredientes e modo de preparo completo aqui: ${currentUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Confira a receita de ${item.title} no Caderno de Receitas!`,
          url: currentUrl,
        });
      } catch (err) {
        console.log("Compartilhamento nativo cancelado:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadImage = async () => {
    const element = cardRef.current;
    if (!element) return;
    setIsGenerating(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FDFBF7",
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `receita-${item.title.toLowerCase().replace(/\s+/g, "-")}-card.png`;
      link.click();
    } catch (e) {
      console.error("Erro ao gerar imagem:", e);
      alert("Não foi possível gerar a imagem preview.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Dimensions classes for card preview
  let containerAspectClass = "w-full aspect-[1.91/1] max-w-lg"; // OpenGraph standard
  if (aspectRatio === "1:1") containerAspectClass = "w-full aspect-square max-w-sm";
  if (aspectRatio === "9:16") containerAspectClass = "w-full aspect-[9/16] max-w-xs";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b pb-3">
          <div>
            <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} /> OpenGraph & Social Media Card
            </span>
            <h2 className="text-xl font-bold text-slate-900">Compartilhar Receita</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 font-bold text-lg">
            <X size={20} />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Formato da Card Preview:</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setAspectRatio("1.91:1")}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                aspectRatio === "1.91:1" ? "border-terracotta bg-sand/60 text-terracotta font-bold shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ImageIcon size={14} />
              <span>WhatsApp / Link (1.91:1)</span>
            </button>

            <button
              onClick={() => setAspectRatio("1:1")}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                aspectRatio === "1:1" ? "border-terracotta bg-sand/60 text-terracotta font-bold shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <ImageIcon size={14} />
              <span>Instagram Feed (1:1)</span>
            </button>

            <button
              onClick={() => setAspectRatio("9:16")}
              className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                aspectRatio === "9:16" ? "border-terracotta bg-sand/60 text-terracotta font-bold shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Smartphone size={14} />
              <span>Stories (9:16)</span>
            </button>
          </div>
        </div>

        {/* Card Canvas Preview Box */}
        <div className="flex justify-center bg-slate-100 p-4 rounded-2xl overflow-hidden border border-slate-200">
          <div
            ref={cardRef}
            className={`bg-gradient-to-br from-[#FDFBF7] via-[#FFF8F3] to-[#F7EBE3] p-6 rounded-2xl border border-terracotta/30 shadow-lg flex flex-col justify-between ${containerAspectClass}`}
          >
            {/* Top Branding */}
            <div className="flex items-center justify-between border-b pb-2 border-terracotta/20">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
                <span className="font-bold text-xs tracking-wider text-slate-800 uppercase">
                  Caderno de Receitas
                </span>
              </div>
              <span className="text-[10px] font-semibold bg-terracotta/10 text-terracotta px-2 py-0.5 rounded-full uppercase">
                {CATEGORY_LABEL[item.category] || item.category}
              </span>
            </div>

            {/* Content Body */}
            <div className="my-auto py-3 space-y-2">
              <h3 className="font-extrabold text-slate-900 leading-tight text-xl sm:text-2xl">
                {item.title}
              </h3>

              {item.summary && (
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              )}

              {/* Tags & Nutrition */}
              <div className="flex flex-wrap gap-2 pt-2">
                {item.level && (
                  <span className="text-[11px] bg-white/80 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 font-medium">
                    🏆 {item.level}
                  </span>
                )}
                {item.time && (
                  <span className="text-[11px] bg-white/80 text-slate-700 px-2 py-1 rounded-lg border border-slate-200 font-medium">
                    ⏱ {item.time}
                  </span>
                )}
                {item.nutrition?.calories && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                    🔥 {item.nutrition.calories} kcal
                  </span>
                )}
              </div>

              {/* Ingredients preview */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Ingredientes Principais:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.ingredients.slice(0, 4).map((ing, i) => (
                      <span key={i} className="text-[10px] bg-white text-slate-800 border border-slate-200 px-2 py-0.5 rounded font-medium">
                        • {ing}
                      </span>
                    ))}
                    {item.ingredients.length > 4 && (
                      <span className="text-[10px] text-slate-500 font-medium py-0.5 px-1">
                        +{item.ingredients.length - 4} mais
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Watermark */}
            <div className="pt-3 border-t border-terracotta/20 flex items-center justify-between text-[10px] text-slate-500">
              <span>Acesse & cozinhe no app</span>
              <span className="font-bold text-terracotta">caderno-de-receitas.app</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          <button
            onClick={handleDownloadImage}
            disabled={isGenerating}
            className="btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
          >
            <Download size={15} />
            <span>{isGenerating ? "Gerando..." : "Baixar Card (PNG)"}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold py-2 flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Send size={15} />
            <span>WhatsApp</span>
          </button>

          {typeof navigator !== "undefined" && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <Share2 size={15} />
              <span>Outros Apps</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            <span>{copied ? "Link Copiado!" : "Copiar Link"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
