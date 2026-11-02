import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Helmet } from 'react-helmet-async';
export const SEO = ({ title, description }) => {
    return (_jsxs(Helmet, { children: [_jsxs("title", { children: [title, " | Caderno de Receitas"] }), _jsx("meta", { name: "description", content: description })] }));
};
