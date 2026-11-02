import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
export const CommunityFeed = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [comments, setComments] = useState([]);
    useEffect(() => {
        supabase.from('items').select('id, title, user_id').order('id', { ascending: false }).limit(5).then(({ data }) => setItems(data || []));
        supabase.from('comments').select('id, content, author_name').order('created_at', { ascending: false }).limit(5).then(({ data }) => setComments(data || []));
    }, []);
    const follow = async (authorId) => {
        if (!user)
            return;
        await supabase.from('follows').insert({ follower_id: user.id, following_id: authorId });
        alert('Seguindo!');
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("section", { className: "card space-y-2", children: [_jsx("h2", { className: "text-lg font-bold", children: "Receitas Recentes" }), items.map(i => (_jsxs("div", { className: "flex justify-between items-center p-2 border rounded-lg", children: [_jsx(Link, { to: `/item/${i.id}`, className: "hover:underline", children: i.title }), _jsx("button", { className: "btn-secondary text-xs", onClick: () => follow(i.user_id), children: "Seguir Autor" })] }, i.id)))] }), _jsxs("section", { className: "card space-y-2", children: [_jsx("h2", { className: "text-lg font-bold", children: "Discuss\u00F5es Recentes" }), comments.map(c => (_jsxs("p", { className: "text-sm border-b pb-1", children: [_jsxs("strong", { children: [c.author_name, ":"] }), " ", c.content] }, c.id)))] })] }));
};
