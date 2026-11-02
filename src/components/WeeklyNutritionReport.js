import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
export const WeeklyNutritionReport = () => {
    const { user } = useAuth();
    const [data, setData] = useState([]);
    useEffect(() => {
        if (!user)
            return;
        // Mocking data fetching for trend report
        const fetchTrend = async () => {
            const { data: activities } = await supabase
                .from('user_activities')
                .select('completed_at')
                .eq('user_id', user.id)
                .gte('completed_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
            // Mocking nutritional values associated with activities
            const mockData = [
                { date: '2026-10-25', calories: 2000 },
                { date: '2026-10-26', calories: 2200 },
                { date: '2026-10-27', calories: 1800 },
                { date: '2026-10-28', calories: 2100 },
                { date: '2026-10-29', calories: 2500 },
                { date: '2026-10-30', calories: 1900 },
                { date: '2026-10-31', calories: 2300 },
            ];
            setData(mockData);
        };
        fetchTrend();
    }, [user]);
    return (_jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Tend\u00EAncia de Consumo (\u00DAltimos 7 dias)" }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "calories", stroke: "#e11d48", strokeWidth: 2 })] }) }) })] }));
};
