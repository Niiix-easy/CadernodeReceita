export function Spinner({ label = "Carregando…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-16 text-muted">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-terracotta border-t-transparent" aria-hidden />
      <span>{label}</span>
    </div>
  );
}
