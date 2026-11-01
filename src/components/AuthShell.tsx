import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <BookOpen className="mx-auto mb-2 text-terracotta" size={36} aria-hidden />
          <h1 className="text-2xl font-bold text-terracotta-dark">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="card">{children}</div>
      </div>
    </div>
  );
}
