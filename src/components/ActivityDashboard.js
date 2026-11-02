import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
export const ActivityDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    useEffect(() => {
        if (!user)
            return;
        (async () => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const { data: favs } = await supabase.from('favorites').select('created_at').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString());
            const { data: list } = await supabase.from('shopping_list').select('created_at').eq('user_id', user.id).gte('created_at', thirtyDaysAgo.toISOString());
            const combined = [...(favs || []), ...(list || [])];
            const counts = {};
            combined.forEach(item => {
                const date = new Date(item.created_at).toLocaleDateString('pt-BR');
                counts[date] = (counts[date] || 0) + 1;
            });
            setData(Object.entries(counts).map(([date, count]) => ({ date, count })));
        })();
    }, [user]);
    return (_jsxs("div", { className: "h-64 w-full", children: [_jsx("h2", { className: "text-lg font-bold mb-4", children: "Atividade nos \u00DAltimos 30 Dias" }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Area, { type: "monotone", dataKey: "count", stroke: "#E28B6E", fill: "#E28B6E" })] }) })] }));
};
