import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { WifiOff } from 'lucide-react';
export const OfflineFallback = () => {
    return (_jsxs("div", { className: "card text-center space-y-4 p-8", children: [_jsx(WifiOff, { size: 48, className: "mx-auto text-muted" }), _jsx("h2", { className: "text-2xl font-bold", children: "Voc\u00EA est\u00E1 offline" }), _jsx("p", { className: "text-muted", children: "Parece que sua conex\u00E3o caiu. Algumas funcionalidades podem estar limitadas." }), _jsx(Link, { to: "/", className: "btn-primary inline-block", children: "Voltar para o In\u00EDcio" })] }));
};
