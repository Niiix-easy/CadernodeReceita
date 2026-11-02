import { Link } from "react-router-dom";
import { Clock, Lock, AlertTriangle } from "lucide-react";
import type { CatalogItem } from "@/lib/types";
import { CATEGORY_LABEL } from "@/lib/types";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { useGoals } from "@/context/GoalContext";

export function ItemCard({ item, locked }: { item: CatalogItem & { nutrition?: any }; locked: boolean }) {
  const { checkRecipeExceedsThreshold } = useGoals();
  const thresholdAlert = checkRecipeExceedsThreshold(item.nutrition);

  return (
    <Link
      to={locked ? "/planos" : `/item/${item.id}`}
      state={locked ? { message: "Esse conteúdo é para assinantes Premium." } : undefined}
      className="card flex h-full flex-col gap-2 transition-shadow hover:shadow-md relative"
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-terracotta-dark">
          {CATEGORY_LABEL[item.category] || item.category}
        </span>
        {thresholdAlert.anyExceeded && (
          <span
            className="text-[10px] bg-red-100 text-red-800 border border-red-300 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1"
            title={`Atenção nutricional: ${thresholdAlert.reason}`}
          >
            <AlertTriangle size={11} />
            Alto Calórico / Macro
          </span>
        )}
      </div>

      <div className="flex gap-1 mb-1">
        {item.category === "food" && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Delicioso</span>}
        {item.category === "health" && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Bem-estar</span>}
        {item.category === "soap" && <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Artesanal</span>}
        {item.verified && <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-bold">✓ Verificada</span>}
      </div>
      <h3 className="text-lg font-bold leading-snug">{item.title}</h3>
      <div className="mt-auto flex flex-wrap items-center gap-3 text-sm text-muted">
        {item.level && <DifficultyBadge level={item.level} />}
        {item.time && (
          <span className="inline-flex items-center gap-1"><Clock size={14} aria-hidden /> {item.time}</span>
        )}
        {locked && (
          <span className="ml-auto inline-flex items-center gap-1 font-medium text-terracotta-dark">
            <Lock size={14} aria-hidden /> Premium
          </span>
        )}
      </div>
    </Link>
  );
}

