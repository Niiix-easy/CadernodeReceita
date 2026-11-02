import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface PantryItem {
  id: string;
  name: string;
  category: string; // Hortifruti, Laticínios, Mercearia, etc.
  entry_date: string; // YYYY-MM-DD
  shelf_life_days: number;
  quantity: string;
  status: "fresh" | "expiring_soon" | "expired";
  daysRemaining: number;
}

interface PantryContextType {
  items: PantryItem[];
  addItem: (item: Omit<PantryItem, "id" | "status" | "daysRemaining">) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  expiringItems: PantryItem[];
  loading: boolean;
}

const PantryContext = createContext<PantryContextType>({
  items: [],
  addItem: async () => {},
  removeItem: async () => {},
  expiringItems: [],
  loading: true,
});

const DEFAULT_PANTRY_ITEMS: Omit<PantryItem, "status" | "daysRemaining">[] = [
  { id: "1", name: "Leite desnatado", category: "Laticínios", entry_date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], shelf_life_days: 7, quantity: "1L" },
  { id: "2", name: "Ovos orgânicos", category: "Laticínios", entry_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0], shelf_life_days: 14, quantity: "12 un" },
  { id: "3", name: "Tomates", category: "Hortifruti", entry_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], shelf_life_days: 7, quantity: "500g" },
  { id: "4", name: "Farinha de trigo", category: "Mercearia", entry_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0], shelf_life_days: 90, quantity: "1kg" },
];

function calculateStatus(entryDateStr: string, shelfLifeDays: number): { status: "fresh" | "expiring_soon" | "expired"; daysRemaining: number } {
  const entry = new Date(entryDateStr);
  const expiryDate = new Date(entry.getTime() + shelfLifeDays * 86400000);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return { status: "expired", daysRemaining };
  if (daysRemaining <= 3) return { status: "expiring_soon", daysRemaining };
  return { status: "fresh", daysRemaining };
}

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPantry = async () => {
      let rawItems = DEFAULT_PANTRY_ITEMS;
      const saved = localStorage.getItem("pantry_items");
      if (saved) {
        try {
          rawItems = JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }

      if (user) {
        const { data } = await supabase.from("pantry_items").select("*").eq("user_id", user.id);
        if (data && data.length > 0) {
          rawItems = data;
        }
      }

      const calculated = rawItems.map((item) => {
        const { status, daysRemaining } = calculateStatus(item.entry_date, item.shelf_life_days);
        return { ...item, status, daysRemaining };
      });

      setItems(calculated);
      setLoading(false);
    };

    loadPantry();
  }, [user]);

  const saveState = (updated: PantryItem[]) => {
    setItems(updated);
    localStorage.setItem("pantry_items", JSON.stringify(updated));
  };

  const addItem = async (newItemData: Omit<PantryItem, "id" | "status" | "daysRemaining">) => {
    const id = Date.now().toString();
    const { status, daysRemaining } = calculateStatus(newItemData.entry_date, newItemData.shelf_life_days);
    const newItem: PantryItem = { ...newItemData, id, status, daysRemaining };

    const updated = [newItem, ...items];
    saveState(updated);

    if (user) {
      await supabase.from("pantry_items").insert({
        id,
        user_id: user.id,
        name: newItemData.name,
        category: newItemData.category,
        entry_date: newItemData.entry_date,
        shelf_life_days: newItemData.shelf_life_days,
        quantity: newItemData.quantity,
      });
    }
  };

  const removeItem = async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    saveState(updated);
    if (user) {
      await supabase.from("pantry_items").delete().eq("id", id);
    }
  };

  const expiringItems = items.filter((i) => i.status === "expiring_soon" || i.status === "expired");

  return (
    <PantryContext.Provider value={{ items, addItem, removeItem, expiringItems, loading }}>
      {children}
    </PantryContext.Provider>
  );
}

export const usePantry = () => useContext(PantryContext);
