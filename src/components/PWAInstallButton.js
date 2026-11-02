import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const PWAInstallButton = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
        setIsInstalled(isStandalone);
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);
    const install = async () => {
        if (!deferredPrompt)
            return false;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setDeferredPrompt(null);
            return true;
        }
        return false;
    };
    if (isInstalled)
        return null;
    if (deferredPrompt) {
        return (_jsx("button", { onClick: install, className: "btn-secondary", children: "Instalar Caderno de Receitas" }));
    }
    if (isIOS) {
        return (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setShowIOSGuide(true), className: "btn-secondary", children: "Instalar no iOS" }), showIOSGuide && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4", children: _jsxs("div", { className: "card w-full max-w-sm", children: [_jsx("h3", { className: "font-bold", children: "Instalar no iPhone / iPad" }), _jsxs("p", { className: "mt-2 text-sm", children: ["1. Toque no bot\u00E3o ", _jsx("strong", { children: "Compartilhar" }), " no Safari.", _jsx("br", {}), "2. Role para baixo e toque em ", _jsx("strong", { children: "Adicionar \u00E0 Tela de In\u00EDcio" }), "."] }), _jsx("button", { onClick: () => setShowIOSGuide(false), className: "btn-primary mt-4 w-full", children: "Fechar" })] }) }))] }));
    }
    return null;
};
