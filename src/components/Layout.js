import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, Heart, LogOut, Crown, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useState } from "react";
const nav = "flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:bg-sand";
const active = "bg-sand text-terracotta-dark";
export function Layout() {
    const { signOut } = useAuth();
    const { isPremium } = useSubscription();
    const isOnline = useOnlineStatus();
    const [isDark, setIsDark] = useState(false);
    const toggleDark = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };
    return (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx("div", { className: `fixed top-2 right-2 px-3 py-1 rounded-full z-50 text-xs font-bold text-white ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`, role: "status", children: isOnline ? '● Online' : '○ Offline' }), _jsx("header", { className: "sticky top-0 z-10 border-b border-ink/10 bg-[--bg]/95 backdrop-blur", children: _jsxs("div", { className: "mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-2 font-display text-lg font-bold text-terracotta-dark", "aria-label": "Ir para a p\u00E1gina inicial", children: [_jsx(BookOpen, { size: 22, "aria-hidden": true }), " Caderno de Receitas"] }), _jsx("button", { onClick: toggleDark, "aria-label": "Alternar modo escuro", className: "p-2 rounded-lg hover:bg-sand", children: isDark ? _jsx(Sun, { size: 18 }) : _jsx(Moon, { size: 18 }) })] }), _jsxs("nav", { "aria-label": "Navega\u00E7\u00E3o Principal", className: "flex flex-wrap items-center gap-1", children: [_jsx(PWAInstallButton, {}), _jsx(NavLink, { to: "/", end: true, className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "P\u00E1gina Inicial", children: "In\u00EDcio" }), _jsxs(NavLink, { to: "/favoritos", className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "Ver suas Receitas Favoritas", children: [_jsx(Heart, { size: 16, "aria-hidden": true }), " Favoritos"] }), _jsxs(NavLink, { to: "/assinatura", className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "Gerenciar sua Assinatura Premium", children: [_jsx(Crown, { size: 16, "aria-hidden": true }), " ", isPremium ? "Premium" : "Assinar"] }), _jsx(NavLink, { to: "/perfil", className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "Acessar Perfil do Usu\u00E1rio", children: "Perfil" }), _jsx(NavLink, { to: "/lista-compras", className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "Gerenciar sua Lista de Compras", children: "Lista de Compras" }), _jsx(NavLink, { to: "/planejador", className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "Abrir Planejador de Refei\u00E7\u00F5es", children: "Planejador" }), _jsx(NavLink, { to: "/apresentacao", className: ({ isActive }) => `${nav} ${isActive ? active : ""}`, "aria-label": "Ver Sobre a Plataforma", children: "Sobre" }), _jsxs("button", { type: "button", onClick: () => void signOut(), className: `${nav} focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta`, title: "Sair da Conta", "aria-label": "Sair da sua conta", children: [_jsx(LogOut, { size: 16, "aria-hidden": true }), " Sair"] })] })] }) }), _jsx("main", { className: "mx-auto w-full max-w-5xl flex-1 px-4 py-6", children: _jsx(Outlet, {}) }), _jsx("footer", { className: "border-t border-ink/10 px-4 py-4 text-center text-xs text-muted", children: "Receitas e dicas reunidas de fontes p\u00FAblicas; sempre confira a fonte original." })] }));
}
