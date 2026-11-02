import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
export const KitchenTimer = ({ prepTime, cookTime }) => {
    const [timers, setTimers] = useState([]);
    useEffect(() => {
        const newTimers = [];
        if (prepTime)
            newTimers.push({ id: 1, label: 'Preparo', timeLeft: prepTime * 60, isRunning: false });
        if (cookTime)
            newTimers.push({ id: 2, label: 'Cozimento', timeLeft: cookTime * 60, isRunning: false });
        setTimers(newTimers);
    }, [prepTime, cookTime]);
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => prev.map(t => t.isRunning && t.timeLeft > 0 ? { ...t, timeLeft: t.timeLeft - 1 } : t));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    return (_jsx("div", { className: "space-y-4", children: timers.map(t => (_jsxs("div", { className: "card flex items-center justify-between p-4 bg-sand border border-terracotta/20", children: [_jsxs("span", { className: "font-bold", children: [t.label, ": ", formatTime(t.timeLeft)] }), _jsx("button", { className: "btn-secondary", onClick: () => setTimers(prev => prev.map(item => item.id === t.id ? { ...item, isRunning: !item.isRunning } : item)), children: t.isRunning ? _jsx(Pause, { size: 18 }) : _jsx(Play, { size: 18 }) })] }, t.id))) }));
};
