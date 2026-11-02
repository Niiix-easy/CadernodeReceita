import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Check, Trash2, Plus, Sparkles, Tag, ArrowRight, Store } from "lucide-react";

interface ShoppingItem {
  id: number | string;
  ingredient: string;
  amount?: string;
  checked?: boolean;
  user_id?: string;
}

const AISLES = [
  { id: "Hortifruti", label: "Hortifruti & Orgânicos", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "Laticínios", label: "Laticínios & Ovos", color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "Açougue", label: "Açougue & Peixaria", color: "text-red-700 bg-red-50 border-red-200" },
  { id: "Mercearia", label: "Mercearia & Grãos", color: "text-orange-700 bg-orange-50 border-orange-200" },
  { id: "Padaria", label: "Padaria & Confeitaria", color: "text-yellow-800 bg-yellow-50 border-yellow-200" },
  { id: "Bebidas", label: "Bebidas & Sucos", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "Limpeza", label: "Limpeza & Higiene", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { id: "Outros", label: "Outros Artigos", color: "text-slate-700 bg-slate-50 border-slate-200" }
];

const KEYWORD_AISLE_MAP: Record<string, string> = {
  // Laticinios
  'leite': "Laticínios", 'queijo': "Laticínios", 'ovo': "Laticínios", 'manteiga': "Laticínios", 'iogurte': "Laticínios", 'creme': "Laticínios", 'requeijão': "Laticínios",
  // Hortifruti
  'fruta': "Hortifruti", 'verdura': "Hortifruti", 'legume': "Hortifruti", 'alface': "Hortifruti", 'tomate': "Hortifruti", 'cebola': "Hortifruti", 'alho': "Hortifruti", 'batata': "Hortifruti", 'cenoura': "Hortifruti", 'maçã': "Hortifruti", 'banana': "Hortifruti", 'limão': "Hortifruti", 'cheiro-verde': "Hortifruti", 'coentro': "Hortifruti",
  // Açougue
  'carne': "Açougue", 'frango': "Açougue", 'peixe': "Açougue", 'bovino': "Açougue", 'suíno': "Açougue", 'bacon': "Açougue", 'linguiça': "Açougue", 'filé': "Açougue", 'camarão': "Açougue",
  // Mercearia
  'arroz': "Mercearia", 'feijão': "Mercearia", 'farinha': "Mercearia", 'açúcar': "Mercearia", 'sal': "Mercearia", 'óleo': "Mercearia", 'azeite': "Mercearia", 'macarrão': "Mercearia", 'molho': "Mercearia", 'café': "Mercearia", 'fermento': "Mercearia", 'amido': "Mercearia", 'aveia': "Mercearia",
  // Padaria
  'pão': "Padaria", 'bolo': "Padaria", 'torrada': "Padaria", 'croissante': "Padaria",
  // Bebidas
  'água': "Bebidas", 'suco': "Bebidas", 'refrigerante': "Bebidas", 'cerveja': "Bebidas", 'vinho': "Bebidas",
  // Limpeza
  'sabão': "Limpeza", 'detergente': "Limpeza", 'desinfetante': "Limpeza", 'álcool': "Limpeza", 'papel': "Limpeza"
};

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [aiCategorizing, setAiCategorizing] = useState(false);
  const [manualAisle, setManualAisle] = useState<string>("auto");

  useEffect(() => {
    const fetchList = async () => {
      if (user) {
        const { data } = await supabase.from("shopping_list").select("*").eq("user_id", user.id);
        if (data && data.length > 0) {
          setItems(data.map((i: any) => ({ ...i, checked: i.checked || false })));
          setLoading(false);
          return;
        }
      }
      
      const saved = localStorage.getItem("shopping_list_local");
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      } else {
        // Sample seed list
        const seed: ShoppingItem[] = [
          { id: "1", ingredient: "Leite desnatado", checked: false },
          { id: "2", ingredient: "Farinha de trigo", checked: false },
          { id: "3", ingredient: "Farinha de trigo (2kg p/ pão)", checked: false },
          { id: "4", ingredient: "Ovos orgânicos (2 dúzias)", checked: false },
          { id: "5", ingredient: "Tomates frescos", checked: false },
          { id: "6", ingredient: "Azeite de oliva extra virgem", checked: false },
          { id: "7", ingredient: "Peito de frango", checked: false },
        ];
        setItems(seed);
        localStorage.setItem("shopping_list_local", JSON.stringify(seed));
      }
      setLoading(false);
    };

    fetchList();
  }, [user]);

  const saveItems = (updated: ShoppingItem[]) => {
    setItems(updated);
    localStorage.setItem("shopping_list_local", JSON.stringify(updated));
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const newObj: ShoppingItem = {
      id: Date.now().toString(),
      ingredient: newItem.trim(),
      checked: false,
    };

    const updated = [...items, newObj];
    saveItems(updated);
    setNewItem("");

    if (user) {
      await supabase.from("shopping_list").insert({
        user_id: user.id,
        ingredient: newObj.ingredient,
      });
    }
  };

  const toggleCheck = async (id: number | string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i));
    saveItems(updated);
    if (user && typeof id === "number") {
      const item = updated.find((i) => i.id === id);
      await supabase.from("shopping_list").update({ checked: item?.checked }).eq("id", id);
    }
  };

  const removeItem = async (id: number | string) => {
    const updated = items.filter((i) => i.id !== id);
    saveItems(updated);
    if (user && typeof id === "number") {
      await supabase.from("shopping_list").delete().eq("id", id);
    }
  };

  const clearChecked = async () => {
    const updated = items.filter((i) => !i.checked);
    saveItems(updated);
  };

  const getAisle = (ingredientName: string) => {
    const lower = ingredientName.toLowerCase();
    for (const [key, aisle] of Object.entries(KEYWORD_AISLE_MAP)) {
      if (lower.includes(key)) return aisle;
    }
    return "Mercearia";
  };

  // Bulk Buy Smart Analysis
  const bulkBuySuggestions = useMemo(() => {
    const counts: Record<string, { count: number; items: string[] }> = {};
    
    items.forEach((item) => {
      const lower = item.ingredient.toLowerCase();
      // Normalize base ingredient keyword
      let baseKey = lower
        .replace(/\(.*?\)/g, "")
        .replace(/\b(de|do|da|dos|das|para|p\/|frescos|frescas|orgânicos|orgânicas|moído|moída|fatiado|fatiada)\b/g, "")
        .trim();

      const words = baseKey.split(" ").filter((w) => w.length > 3);
      const key = words[0] || baseKey;

      if (!counts[key]) {
        counts[key] = { count: 0, items: [] };
      }
      counts[key].count += 1;
      counts[key].items.push(item.ingredient);
    });

    const suggestions = Object.entries(counts)
      .filter(([_, data]) => data.count >= 2 || data.items.some(i => i.includes("kg") || i.includes("dúzia") || i.includes("pacote")))
      .map(([key, data]) => ({
        keyword: key.charAt(0).toUpperCase() + key.slice(1),
        count: data.count,
        items: data.items,
        savingsEstimate: "15% - 25% de economia comprando a embalagem de atacado",
      }));

    return suggestions;
  }, [items]);

  // Group items by Aisle
  const groupedItems = useMemo(() => {
    return items.reduce((acc: Record<string, ShoppingItem[]>, item) => {
      const aisle = getAisle(item.ingredient);
      if (!acc[aisle]) acc[aisle] = [];
      acc[aisle].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);
  }, [items]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-terracotta" size={28} />
            Lista de Compras Inteligente
          </h1>
          <p className="text-sm text-muted">
            Itens categorizados automaticamente por corredor do supermercado.
          </p>
        </div>
        {items.some((i) => i.checked) && (
          <button
            onClick={clearChecked}
            className="btn-secondary text-xs flex items-center gap-1 text-red-600 hover:text-red-700"
          >
            <Trash2 size={14} />
            Limpar Concluídos
          </button>
        )}
      </div>

      {/* Add New Item Form */}
      <form onSubmit={addItem} className="card p-3 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          className="input flex-1 min-w-[220px]"
          placeholder="Adicionar ingrediente ou produto (ex: 1kg Farinha de Trigo)..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button type="submit" className="btn-primary flex items-center gap-1 shrink-0">
          <Plus size={18} />
          Adicionar
        </button>
      </form>

      {/* Bulk Buy Intelligent Alert */}
      {bulkBuySuggestions.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold">
            <Sparkles size={20} className="text-amber-600 shrink-0" />
            <span>Sugestões de Compra em Atacado (Bulk Buy)</span>
          </div>
          <p className="text-xs text-amber-800">
            Identificamos itens recorrentes nas suas receitas recentes. Comprar estes itens em quantidade maior reduz seu custo por unidade:
          </p>
          <div className="grid gap-2 sm:grid-cols-2 mt-2">
            {bulkBuySuggestions.map((sug) => (
              <div key={sug.keyword} className="bg-white/80 p-2.5 rounded-lg border border-amber-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1">
                    <Tag size={13} className="text-amber-600" />
                    {sug.keyword}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    {sug.count > 1 ? `${sug.count}x na lista` : "Volume alto"}
                  </span>
                </div>
                <p className="text-muted text-[11px]">{sug.items.join(", ")}</p>
                <p className="text-emerald-700 font-medium text-[10px]">{sug.savingsEstimate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aisle Grouped Items */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="card text-center py-12 space-y-3">
          <Store className="mx-auto text-muted" size={40} />
          <p className="font-medium text-slate-700">Sua lista de compras está vazia.</p>
          <p className="text-xs text-muted">
            Adicione ingredientes manualmente acima ou clique em "Adicionar à Lista de Compras" em qualquer receita do catálogo!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {AISLES.filter((aisle) => groupedItems[aisle.id] && groupedItems[aisle.id].length > 0).map((aisle) => {
            const aisleItems = groupedItems[aisle.id];
            const completedCount = aisleItems.filter((i) => i.checked).length;

            return (
              <div key={aisle.id} className="card p-4 space-y-3">
                <div className="flex items-center justify-between border-b pb-2 border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${aisle.color}`}>
                      {aisle.label}
                    </span>
                    <span className="text-xs text-muted">
                      ({aisleItems.length} {aisleItems.length === 1 ? "item" : "itens"})
                    </span>
                  </div>
                  <span className="text-xs text-muted">
                    {completedCount}/{aisleItems.length} comprados
                  </span>
                </div>

                <ul className="space-y-2">
                  {aisleItems.map((item) => (
                    <li
                      key={item.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                        item.checked ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 hover:border-terracotta/40"
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                        <input
                          type="checkbox"
                          checked={!!item.checked}
                          onChange={() => toggleCheck(item.id)}
                          className="w-4 h-4 rounded text-terracotta focus:ring-terracotta cursor-pointer"
                        />
                        <span className={`text-sm ${item.checked ? "line-through text-muted" : "font-medium text-slate-800"}`}>
                          {item.ingredient}
                        </span>
                      </label>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
                        title="Remover item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
