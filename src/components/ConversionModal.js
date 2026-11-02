import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X } from 'lucide-react';
export const ConversionModal = ({ isOpen, onClose }) => {
    const [value, setValue] = useState(0);
    const [type, setType] = useState('temp');
    const convert = () => {
        if (type === 'temp') {
            return { label: 'Fahrenheit', result: (value * 9 / 5 + 32).toFixed(1) + '°F' };
        }
        if (type === 'weight') {
            return { label: 'Gramas', result: (value * 28.35).toFixed(1) + 'g' };
        }
        return { label: 'Litros', result: (value * 0.236).toFixed(1) + 'L' };
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4", children: _jsxs("div", { className: "card w-full max-w-sm space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-bold", children: "Convers\u00E3o R\u00E1pida" }), _jsx("button", { onClick: onClose, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: `btn-secondary flex-1 text-xs ${type === 'temp' ? 'bg-terracotta text-white' : ''}`, onClick: () => setType('temp'), children: "Temp (\u00B0C \u2192 \u00B0F)" }), _jsx("button", { className: `btn-secondary flex-1 text-xs ${type === 'weight' ? 'bg-terracotta text-white' : ''}`, onClick: () => setType('weight'), children: "Peso (oz \u2192 g)" }), _jsx("button", { className: `btn-secondary flex-1 text-xs ${type === 'volume' ? 'bg-terracotta text-white' : ''}`, onClick: () => setType('volume'), children: "Vol (cups \u2192 L)" })] }), _jsx("input", { type: "number", className: "input w-full", value: value, onChange: (e) => setValue(Number(e.target.value)), placeholder: "Valor" }), _jsxs("div", { className: "p-3 bg-sand rounded-lg text-center", children: [_jsx("p", { className: "text-sm font-semibold text-muted uppercase", children: convert().label }), _jsx("p", { className: "text-2xl font-bold", children: convert().result })] })] }) }));
};
