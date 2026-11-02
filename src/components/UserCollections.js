import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CollectionModal } from '@/components/CollectionModal';
export const UserCollections = () => {
    const { user } = useAuth();
    const [collections, setCollections] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchCollections = async () => {
        if (!user)
            return;
        const { data } = await supabase.from('user_collections').select('*, collection_items(item_id)').eq('user_id', user.id);
        setCollections(data || []);
    };
    useEffect(() => {
        fetchCollections();
    }, [user]);
    const addCollection = async (name) => {
        if (!user)
            return;
        await supabase.from('user_collections').insert({ user_id: user.id, name });
        fetchCollections();
    };
    return (_jsxs("div", { className: "card space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold", children: "Minhas Cole\u00E7\u00F5es" }), _jsx("button", { className: "btn-primary", onClick: () => setIsModalOpen(true), children: "Nova Cole\u00E7\u00E3o" })] }), _jsx(CollectionModal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), onSave: addCollection }), collections.map(c => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsx("h3", { className: "font-bold", children: c.name }), _jsxs("p", { className: "text-xs text-muted", children: [c.collection_items.length, " receitas"] })] }, c.id)))] }));
};
