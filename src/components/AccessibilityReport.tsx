import React, { useEffect, useState } from 'react';
import { runAccessibilityAudit } from '@/lib/accessibilityAudit';

export const AccessibilityReport: React.FC = () => {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    setReport(runAccessibilityAudit());
  }, []);

  if (!report) return null;

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-bold">Relatório de Acessibilidade (Auditoria Automática)</h2>
      <div className="text-3xl font-bold text-terracotta">Score de Qualidade: {report.score}/100</div>
      <ul className="space-y-2 text-sm">
        <li className="p-2 border rounded-lg">Elementos interativos sem label: {report.missingAria}</li>
        <li className="p-2 border rounded-lg">Ratio de contraste estimado: {report.contrastRatio}:1</li>
      </ul>
      <button className="btn-secondary" onClick={() => setReport(runAccessibilityAudit())}>Executar Auditoria Novamente</button>
    </div>
  );
};
