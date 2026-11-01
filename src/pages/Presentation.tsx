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

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-display font-bold text-terracotta-dark">Bem-vindo ao Caderno de Receitas</h1>
        <p className="text-lg text-muted">A plataforma definitiva para suas receitas, saúde e organização na cozinha.</p>
        <Link to="/planos" className="btn-primary inline-block">Comece agora</Link>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div key={i} className="card space-y-2">
            <f.icon className="text-terracotta" size={32} />
            <h2 className="font-bold text-lg">{f.title}</h2>
            <p className="text-sm text-muted">{f.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
