import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { getCookingStreak } from '@/lib/streaks';
import { useAuth } from '@/context/AuthContext';
export const CookingStreak = () => {
    const { user } = useAuth();
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        getCookingStreak(user.id).then(s => {
            setStreak(s);
            setLoading(false);
        });
    }, [user]);
    if (loading || streak === 0)
        return null;
    return (_jsxs("div", { className: "card bg-orange-50 border-orange-200 flex items-center justify-between p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "bg-orange-500 p-2 rounded-full text-white", children: _jsx(Flame, { size: 24 }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-bold text-orange-900", children: "Sua Sequ\u00EAncia!" }), _jsxs("p", { className: "text-sm text-orange-800", children: ["Voc\u00EA est\u00E1 cozinhando h\u00E1 ", streak, " ", streak === 1 ? 'dia' : 'dias', " seguidos."] })] })] }), _jsx("div", { className: "text-2xl font-black text-orange-600", children: streak })] }));
};
