import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("shopping_list").select("*").eq("user_id", user.id).then(({ data }) => setItems(data || []));
  }, [user]);

  async function removeItem(id: number) {
    await supabase.from("shopping_list").delete().eq("id", id);
    setItems(items.filter(i => i.id !== id));
  }

  const AISLE_MAP: Record<string, string> = {
    'leite': 'Laticínios', 'queijo': 'Laticínios', 'ovo': 'Laticínios', 'manteiga': 'Laticínios', 'iogurte': 'Laticínios', 'creme': 'Laticínios',
    'fruta': 'Hortifruti', 'verdura': 'Hortifruti', 'legume': 'Hortifruti', 'alface': 'Hortifruti', 'tomate': 'Hortifruti', 'cebola': 'Hortifruti', 'alho': 'Hortifruti', 'batata': 'Hortifruti', 'cenoura': 'Hortifruti',
    'carne': 'Açougue', 'frango': 'Açougue', 'peixe': 'Açougue', 'bovino': 'Açougue', 'suíno': 'Açougue', 'bacon': 'Açougue', 'linguiça': 'Açougue',
    'arroz': 'Mercearia', 'feijão': 'Mercearia', 'farinha': 'Mercearia', 'açúcar': 'Mercearia', 'sal': 'Mercearia', 'óleo': 'Mercearia', 'azeite': 'Mercearia', 'macarrão': 'Mercearia', 'molho': 'Mercearia', 'café': 'Mercearia',
    'limpeza': 'Limpeza', 'sabão': 'Limpeza', 'detergente': 'Limpeza', 'desinfetante': 'Limpeza', 'álcool': 'Limpeza'
  };

  const getAisle = (ingredient: string) => {
    const lower = ingredient.toLowerCase();
    for (const [key, aisle] of Object.entries(AISLE_MAP)) {
      if (lower.includes(key)) return aisle;
    }
    return 'Mercearia';
  };

  const groupedItems = items.reduce((acc: Record<string, any[]>, item: any) => {
    const aisle = getAisle(item.ingredient);
    if (!acc[aisle]) acc[aisle] = [];
    acc[aisle].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="card space-y-4">
      <h1 className="text-2xl font-bold">Lista de Compras</h1>
      {Object.entries(groupedItems).map(([aisle, items]) => (
        <div key={aisle} className="space-y-2">
          <h2 className="font-bold text-terracotta">{aisle}</h2>
          <ul className="space-y-2">
            {items.map(i => (
              <li key={i.id} className="flex justify-between items-center p-2 border rounded-lg">
                {i.ingredient}
                <button className="btn-danger text-xs px-2 py-1" onClick={() => removeItem(i.id)}>Remover</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
