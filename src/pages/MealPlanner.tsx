import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor } from '@dnd-kit/core';

const DAYS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];

export default function MealPlanner() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [plan, setPlan] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('favorites').select('item:items(id, title)').eq('user_id', user.id).then(({ data }) => setFavorites(data || []));
    supabase.from('meal_plans').select('id, day_of_week, item:items(id, title)').eq('user_id', user.id).then(({ data }) => setPlan(data || []));
  }, [user]);

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || !user) return;
    
    const itemId = active.id;
    const day = over.id;
    
    const { data } = await supabase.from('meal_plans').insert({ user_id: user.id, item_id: itemId, day_of_week: day }).select('id, day_of_week, item:items(id, title)').single();
    if (data) setPlan([...plan, data]);
  };

  return (
    <div className="card space-y-6">
      <h1 className="text-2xl font-bold">Planejador Semanal</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h2 className="font-bold">Seus Favoritos</h2>
            {favorites.map(f => (
              <div key={f.item.id} className="p-2 border rounded-lg cursor-grab">{f.item.title}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map(day => (
              <div key={day} className="p-4 border rounded-lg bg-sand min-h-[200px]">
                <h3 className="font-bold text-center">{day.toUpperCase()}</h3>
                {plan.filter(p => p.day_of_week === day).map(p => (
                  <div key={p.id} className="p-2 mt-2 border rounded-lg bg-white text-sm">{p.item.title}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
