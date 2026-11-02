import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DndContext } from '@dnd-kit/core';
const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
export default function MealPlanner() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [plan, setPlan] = useState([]);
    useEffect(() => {
        if (!user)
            return;
        supabase.from('favorites').select('item:items(id, title)').eq('user_id', user.id).then(({ data }) => setFavorites(data || []));
        supabase.from('meal_plans').select('id, day_of_week, item:items(id, title)').eq('user_id', user.id).then(({ data }) => setPlan(data || []));
    }, [user]);
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || !user)
            return;
        const itemId = active.id;
        const day = over.id;
        const { data } = await supabase.from('meal_plans').insert({ user_id: user.id, item_id: itemId, day_of_week: day }).select('id, day_of_week, item:items(id, title)').single();
        if (data)
            setPlan([...plan, data]);
    };
    return (_jsxs("div", { className: "card space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold", children: "Planejador Semanal" }), _jsx(DndContext, { onDragEnd: handleDragEnd, children: _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h2", { className: "font-bold", children: "Seus Favoritos" }), favorites.map(f => (_jsx("div", { className: "p-2 border rounded-lg cursor-grab", children: f.item.title }, f.item.id)))] }), _jsx("div", { className: "grid grid-cols-7 gap-2", children: DAYS.map(day => (_jsxs("div", { className: "p-4 border rounded-lg bg-sand min-h-[200px]", children: [_jsx("h3", { className: "font-bold text-center", children: day.toUpperCase() }), plan.filter(p => p.day_of_week === day).map(p => (_jsx("div", { className: "p-2 mt-2 border rounded-lg bg-white text-sm", children: p.item.title }, p.id)))] }, day))) })] }) })] }));
}
