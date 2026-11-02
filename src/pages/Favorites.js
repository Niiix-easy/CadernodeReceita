import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ItemCard } from "@/components/ItemCard";
import { Spinner } from "@/components/Spinner";
import { useAuth } from "@/context/AuthContext";
export default function Favorites() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!user)
            return;
        let alive = true;
        (async () => {
            const { data: favs, error: e1 } = await supabase.from("favorites").select("item_id").eq("user_id", user.id);
            if (!alive)
                return;
            if (e1) {
                setError("Não foi possível carregar seus favoritos.");
                setLoading(false);
                return;
            }
            const ids = (favs ?? []).map((f) => f.item_id);
            if (ids.length === 0) {
                setItems([]);
                setLoading(false);
                return;
            }
            const { data, error: e2 } = await supabase.from("items_catalog").select("id,category,title,level,time").in("id", ids);
            if (!alive)
                return;
            if (e2)
                setError("Não foi possível carregar seus favoritos.");
            else
                setItems((data ?? []));
            setLoading(false);
        })();
        return () => { alive = false; };
    }, [user]);
    if (loading)
        return _jsx(Spinner, {});
    return (_jsxs("div", { className: "space-y-4", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Meus favoritos" }), error && _jsx("p", { role: "alert", className: "rounded-lg bg-red-50 p-3 text-sm text-red-800", children: error }), items.length === 0 && !error ? (_jsxs("div", { className: "card text-center", children: [_jsx("p", { className: "font-medium", children: "Voc\u00EA ainda n\u00E3o favoritou nada." }), _jsx("p", { className: "mt-1 text-sm text-muted", children: "Toque no cora\u00E7\u00E3o dentro de uma receita para salv\u00E1-la aqui." }), _jsx(Link, { to: "/", className: "btn-primary mt-3", children: "Explorar receitas" })] })) : (_jsx("ul", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: items.map((i) => _jsx("li", { children: _jsx(ItemCard, { item: i, locked: false }) }, i.id)) }))] }));
}
