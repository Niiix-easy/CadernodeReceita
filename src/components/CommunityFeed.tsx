import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';

export const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('items').select('id, title, user_id').order('id', { ascending: false }).limit(5).then(({ data }) => setItems(data || []));
    supabase.from('comments').select('id, content, author_name').order('created_at', { ascending: false }).limit(5).then(({ data }) => setComments(data || []));
  }, []);

  const follow = async (authorId: string) => {
    if (!user) return;
    await supabase.from('follows').insert({ follower_id: user.id, following_id: authorId });
    alert('Seguindo!');
  };

  return (
    <div className="space-y-6">
      <section className="card space-y-2">
        <h2 className="text-lg font-bold">Receitas Recentes</h2>
        {items.map(i => (
          <div key={i.id} className="flex justify-between items-center p-2 border rounded-lg">
            <Link to={`/item/${i.id}`} className="hover:underline">{i.title}</Link>
            <button className="btn-secondary text-xs" onClick={() => follow(i.user_id)}>Seguir Autor</button>
          </div>
        ))}
      </section>
      <section className="card space-y-2">
        <h2 className="text-lg font-bold">Discussões Recentes</h2>
        {comments.map(c => (
          <p key={c.id} className="text-sm border-b pb-1"><strong>{c.author_name}:</strong> {c.content}</p>
        ))}
      </section>
    </div>
  );
};
