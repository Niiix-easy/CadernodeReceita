import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { runAccessibilityAudit } from '@/lib/accessibilityAudit';
export const AccessibilityReport = () => {
    const [report, setReport] = useState(null);
    useEffect(() => {
        setReport(runAccessibilityAudit());
    }, []);
    if (!report)
        return null;
    return (_jsxs("div", { className: "card space-y-4", children: [_jsx("h2", { className: "text-xl font-bold", children: "Relat\u00F3rio de Acessibilidade (Auditoria Autom\u00E1tica)" }), _jsxs("div", { className: "text-3xl font-bold text-terracotta", children: ["Score de Qualidade: ", report.score, "/100"] }), _jsxs("ul", { className: "space-y-2 text-sm", children: [_jsxs("li", { className: "p-2 border rounded-lg", children: ["Elementos interativos sem label: ", report.missingAria] }), _jsxs("li", { className: "p-2 border rounded-lg", children: ["Ratio de contraste estimado: ", report.contrastRatio, ":1"] })] }), _jsx("button", { className: "btn-secondary", onClick: () => setReport(runAccessibilityAudit()), children: "Executar Auditoria Novamente" })] }));
};
