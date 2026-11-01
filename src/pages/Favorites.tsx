import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import type { CatalogItem } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";

export default function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const { data: favs, error: e1 } = await supabase.from("favorites").select("item_id").eq("user_id", user.id);
      if (!alive) return;
      if (e1) { setError("Não foi possível carregar seus favoritos."); setLoading(false); return; }
      const ids = (favs ?? []).map((f) => f.item_id as string);
      if (ids.length === 0) { setItems([]); setLoading(false); return; }
      const { data, error: e2 } = await supabase.from("items_catalog").select("id,category,title,level,time").in("id", ids);
      if (!alive) return;
      if (e2) setError("Não foi possível carregar seus favoritos."); else setItems((data ?? []) as CatalogItem[]);
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user]);

  if (loading) return <Spinner />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Meus favoritos</h1>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {items.length === 0 && !error ? (
        <div className="card text-center">
          <p className="font-medium">Você ainda não favoritou nada.</p>
          <p className="mt-1 text-sm text-muted">Toque no coração dentro de uma receita para salvá-la aqui.</p>
          <Link to="/" className="btn-primary mt-3">Explorar receitas</Link>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => <li key={i.id}><ItemCard item={i} locked={false} /></li>)}
        </ul>
      )}
    </div>
  );
}
