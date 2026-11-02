import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface GoalContextType {
  goals: UserGoals | null;
  setGoals: (goals: UserGoals) => void;
  loading: boolean;
}

const GoalContext = createContext<GoalContextType>({ goals: null, setGoals: () => {}, loading: true });

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    supabase.from("user_goals").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setGoals(data);
      setLoading(false);
    });
  }, [user]);

  const updateGoals = async (newGoals: UserGoals) => {
    if (!user) return;
    await supabase.from("user_goals").upsert({ user_id: user.id, ...newGoals });
    setGoals(newGoals);
  };

  return (
    <GoalContext.Provider value={{ goals, setGoals: updateGoals, loading }}>
      {children}
    </GoalContext.Provider>
  );
}

export const useGoals = () => useContext(GoalContext);
