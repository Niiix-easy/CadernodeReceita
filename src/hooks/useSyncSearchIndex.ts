import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { saveItems } from '@/lib/db';

export function useSyncSearchIndex() {
  useEffect(() => {
    const sync = async () => {
      if (navigator.onLine) {
        try {
          const { data } = await supabase.from("items_catalog").select("id,category,title,level,time").order("id");
          if (data) {
            await saveItems(data);
            console.log('Índice de busca sincronizado com IndexedDB.');
          }
        } catch (error) {
          console.error('Falha ao sincronizar índice:', error);
        }
      }
    };

    window.addEventListener('online', sync);
    sync();

    return () => window.removeEventListener('online', sync);
  }, []);
}
