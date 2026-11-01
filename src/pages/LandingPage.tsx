import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="space-y-12 py-12 px-4 text-center">
      <section className="space-y-4">
        <h1 className="text-5xl font-extrabold text-terracotta-dark">Caderno de Receitas</h1>
        <p className="text-xl text-muted">Sua cozinha organizada, mais saudável e muito mais prática.</p>
        <div className="flex gap-4 justify-center">
          <Link to="/login" className="btn-primary">Entrar</Link>
          <Link to="/signup" className="btn-secondary">Criar Conta</Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="card space-y-2">
          <h2 className="font-bold text-lg">Catálogo Completo</h2>
          <p className="text-sm text-muted">Milhares de receitas e dicas de saúde.</p>
        </div>
        <div className="card space-y-2">
          <h2 className="font-bold text-lg">Organização Inteligente</h2>
          <p className="text-sm text-muted">Listas de compras e planejamento semanal.</p>
        </div>
        <div className="card space-y-2">
          <h2 className="font-bold text-lg">Nutrição e Praticidade</h2>
          <p className="text-sm text-muted">Acompanhe macros e gerencie seu tempo.</p>
        </div>
      </section>
    </div>
  );
}
