import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export const TutorialOverlay = () => {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        if (!localStorage.getItem('tutorial_seen')) {
            setIsVisible(true);
        }
    }, []);
    const closeTutorial = () => {
        localStorage.setItem('tutorial_seen', 'true');
        setIsVisible(false);
    };
    if (!isVisible)
        return null;
    return (_jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4", children: _jsxs("div", { className: "card w-full max-w-lg space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Bem-vindo ao Caderno de Receitas!" }), _jsx("p", { children: "Este \u00E9 o seu novo espa\u00E7o. Aqui est\u00E3o algumas dicas:" }), _jsxs("ul", { className: "list-disc pl-5 space-y-1", children: [_jsx("li", { children: "Use a barra de busca para encontrar receitas." }), _jsx("li", { children: "Filtre por categorias usando os bot\u00F5es acima." }), _jsx("li", { children: "Check o Feed da Comunidade ao lado para ver o que est\u00E3o postando!" })] }), _jsx("button", { className: "btn-primary w-full", onClick: closeTutorial, children: "Entendido!" })] }) }));
};
