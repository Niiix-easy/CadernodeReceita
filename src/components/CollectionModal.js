import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const CollectionModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "card w-full max-w-sm space-y-4", children: [_jsx("h2", { className: "text-lg font-bold", children: "Nova Cole\u00E7\u00E3o" }), _jsx("input", { className: "input", placeholder: "Nome (ex: Receitas de Ver\u00E3o)", value: name, onChange: (e) => setName(e.target.value) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "btn-secondary", onClick: onClose, children: "Cancelar" }), _jsx("button", { className: "btn-primary", onClick: () => { onSave(name); onClose(); setName(''); }, children: "Salvar" })] })] }) }));
};
