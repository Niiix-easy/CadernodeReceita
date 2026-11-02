import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
export const Collections = () => {
    const { user } = useAuth();
    const [collections, setCollections] = useState([]);
    const [newCol, setNewCol] = useState('');
    useEffect(() => {
        if (!user)
            return;
        supabase.from('collections').select('*').eq('user_id', user.id).then(({ data }) => setCollections(data || []));
    }, [user]);
    const createCollection = async () => {
        if (!user || !newCol.trim())
            return;
        await supabase.from('collections').insert({ user_id: user.id, name: newCol });
        setNewCol('');
        // refresh list
    };
    return (_jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Minhas Cole\u00E7\u00F5es" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "input", value: newCol, onChange: (e) => setNewCol(e.target.value), placeholder: "Nova cole\u00E7\u00E3o..." }), _jsx("button", { className: "btn-primary", onClick: createCollection, children: "Criar" })] }), _jsx("ul", { className: "space-y-2", children: collections.map(c => _jsx("li", { className: "p-2 border rounded-lg", children: c.name }, c.id)) })] }));
};
