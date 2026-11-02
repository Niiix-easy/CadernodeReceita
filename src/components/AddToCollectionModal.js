import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
export const AddToCollectionModal = ({ isOpen, onClose, itemId }) => {
    const [collections, setCollections] = useState([]);
    useEffect(() => {
        if (isOpen) {
            supabase.from('user_collections').select('*').then(({ data }) => setCollections(data || []));
        }
    }, [isOpen]);
    const addToCollection = async (collectionId) => {
        await supabase.from('collection_items').insert({ collection_id: collectionId, item_id: itemId });
        alert('Adicionado à coleção!');
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "card w-full max-w-sm space-y-4", children: [_jsx("h2", { className: "text-lg font-bold", children: "Adicionar \u00E0 Cole\u00E7\u00E3o" }), _jsx("ul", { className: "space-y-2", children: collections.map(c => (_jsx("button", { className: "w-full text-left p-2 border rounded-lg hover:bg-sand", onClick: () => addToCollection(c.id), children: c.name }, c.id))) }), _jsx("button", { className: "btn-secondary w-full", onClick: onClose, children: "Cancelar" })] }) }));
};
