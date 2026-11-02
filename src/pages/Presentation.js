import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { BookOpen, Search, ShoppingCart, CalendarDays, BrainCircuit } from "lucide-react";
export default function Presentation() {
    const features = [
        { title: "Catálogo de Receitas", icon: BookOpen, description: "Explore centenas de receitas e dicas exclusivas." },
        { title: "Pesquisa por Voz", icon: Search, description: "Encontre receitas sem usar as mãos." },
        { title: "Lista de Compras", icon: ShoppingCart, description: "Organize seus ingredientes por corredor." },
        { title: "Planejador Semanal", icon: CalendarDays, description: "Planeje suas refeições da semana." },
        { title: "Informações Nutricionais", icon: BrainCircuit, description: "Acompanhe a nutrição das suas receitas." }
    ];
    return (_jsxs("div", { className: "space-y-12", children: [_jsxs("section", { className: "text-center space-y-4", children: [_jsx("h1", { className: "text-4xl font-display font-bold text-terracotta-dark", children: "Bem-vindo ao Caderno de Receitas" }), _jsx("p", { className: "text-lg text-muted", children: "A plataforma definitiva para suas receitas, sa\u00FAde e organiza\u00E7\u00E3o na cozinha." }), _jsx(Link, { to: "/planos", className: "btn-primary inline-block", children: "Comece agora" })] }), _jsx("section", { className: "grid md:grid-cols-3 gap-6", children: features.map((f, i) => (_jsxs("div", { className: "card space-y-2", children: [_jsx(f.icon, { className: "text-terracotta", size: 32 }), _jsx("h2", { className: "font-bold text-lg", children: f.title }), _jsx("p", { className: "text-sm text-muted", children: f.description })] }, i))) })] }));
}
