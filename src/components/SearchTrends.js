import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export const SearchTrends = () => {
    const [trends, setTrends] = useState([]);
    useEffect(() => {
        supabase.from('search_logs').select('query').then(({ data }) => {
            const counts = {};
            (data || []).forEach(l => counts[l.query] = (counts[l.query] || 0) + 1);
            const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
            setTrends(sorted);
        });
    }, []);
    return (_jsxs("div", { className: "card space-y-2", children: [_jsx("h2", { className: "text-lg font-bold", children: "Buscas em Alta" }), trends.map(([query, count]) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: query }), _jsxs("span", { className: "text-muted", children: [count, " buscas"] })] }, query)))] }));
};
