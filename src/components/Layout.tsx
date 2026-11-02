import { PWAInstallButton } from "@/components/PWAInstallButton";
import { Link, NavLink, Outlet } from "react-router-dom";
import { BookOpen, Heart, LogOut, Crown, Moon, Sun } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useState } from "react";

const nav = "flex min-h-[44px] items-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:bg-sand";
const active = "bg-sand text-terracotta-dark";

import { usePantry } from "@/context/PantryContext";
import { Package } from "lucide-react";

export function Layout() {
  const { signOut } = useAuth();
  const { isPremium } = useSubscription();
  const { expiringItems } = usePantry();
  const isOnline = useOnlineStatus();
  const [isDark, setIsDark] = useState(false);

  const toggleDark = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div 
        className={`fixed top-2 right-2 px-3 py-1 rounded-full z-50 text-xs font-bold text-white ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}
        role="status"
      >
        {isOnline ? '● Online' : '○ Offline'}
      </div>
      <header className="sticky top-0 z-10 border-b border-ink/10 bg-[--bg]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-terracotta-dark" aria-label="Ir para a página inicial">
              <BookOpen size={22} aria-hidden /> Caderno de Receitas
            </Link>
            <button onClick={toggleDark} aria-label="Alternar modo escuro" className="p-2 rounded-lg hover:bg-sand">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <nav aria-label="Navegação Principal" className="flex flex-wrap items-center gap-1">
            <PWAInstallButton />
            <NavLink to="/" end className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Página Inicial">Início</NavLink>
            <NavLink to="/despensa" className={({ isActive }) => `${nav} ${isActive ? active : ""} relative`} aria-label="Acessar sua Despensa">
              <Package size={16} aria-hidden /> Despensa
              {expiringItems.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" title="Itens na despensa vencendo!" />
              )}
            </NavLink>
            <NavLink to="/favoritos" className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Ver suas Receitas Favoritas">
              <Heart size={16} aria-hidden /> Favoritos
            </NavLink>
            <NavLink to="/assinatura" className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Gerenciar sua Assinatura Premium">
              <Crown size={16} aria-hidden /> {isPremium ? "Premium" : "Assinar"}
            </NavLink>
            <NavLink to="/perfil" className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Acessar Perfil do Usuário">Perfil</NavLink>
            <NavLink to="/lista-compras" className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Gerenciar sua Lista de Compras">Lista de Compras</NavLink>
            <NavLink to="/planejador" className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Abrir Planejador de Refeições">Planejador</NavLink>
            <NavLink to="/apresentacao" className={({ isActive }) => `${nav} ${isActive ? active : ""}`} aria-label="Ver Sobre a Plataforma">Sobre</NavLink>
            <button type="button" onClick={() => void signOut()} className={`${nav} focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta`} title="Sair da Conta" aria-label="Sair da sua conta">
              <LogOut size={16} aria-hidden /> Sair
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t border-ink/10 px-4 py-4 text-center text-xs text-muted">
        Receitas e dicas reunidas de fontes públicas; sempre confira a fonte original.
      </footer>
    </div>
  );
}
