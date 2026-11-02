import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthContext";

export interface UserGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface GoalContextType {
  goals: UserGoals;
  setGoals: (goals: UserGoals) => void;
  loading: boolean;
  checkRecipeExceedsThreshold: (recipeNutrition?: {
    calories?: number | string;
    protein?: number | string;
    carbs?: number | string;
    fats?: number | string;
  }) => { exceedsCalories: boolean; exceedsCarbs: boolean; exceedsFats: boolean; exceedsProtein: boolean; anyExceeded: boolean; reason?: string };
}

const DEFAULT_GOALS: UserGoals = {
  calories: 2000,
  protein: 100,
  carbs: 250,
  fats: 65,
};

const GoalContext = createContext<GoalContextType>({
  goals: DEFAULT_GOALS,
  setGoals: () => {},
  loading: true,
  checkRecipeExceedsThreshold: () => ({ exceedsCalories: false, exceedsCarbs: false, exceedsFats: false, exceedsProtein: false, anyExceeded: false }),
});

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoalsState] = useState<UserGoals>(() => {
    const saved = localStorage.getItem("user_goals");
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchGoals = async () => {
      try {
        const { data } = await supabase
          .from("user_goals")
          .select("*")
          .eq("user_id", user.id)
          .single();
        if (data) {
          const loadedGoals = {
            calories: data.calories || DEFAULT_GOALS.calories,
            protein: data.protein || DEFAULT_GOALS.protein,
            carbs: data.carbs || DEFAULT_GOALS.carbs,
            fats: data.fats || DEFAULT_GOALS.fats,
          };
          setGoalsState(loadedGoals);
          localStorage.setItem("user_goals", JSON.stringify(loadedGoals));
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  const updateGoals = async (newGoals: UserGoals) => {
    setGoalsState(newGoals);
    localStorage.setItem("user_goals", JSON.stringify(newGoals));
    if (user) {
      await supabase.from("user_goals").upsert({
        user_id: user.id,
        calories: newGoals.calories,
        protein: newGoals.protein,
        carbs: newGoals.carbs,
        fats: newGoals.fats,
      });
    }
  };

  const checkRecipeExceedsThreshold = (recipeNutrition?: {
    calories?: number | string;
    protein?: number | string;
    carbs?: number | string;
    fats?: number | string;
  }) => {
    if (!recipeNutrition) {
      return { exceedsCalories: false, exceedsCarbs: false, exceedsFats: false, exceedsProtein: false, anyExceeded: false };
    }

    const parseVal = (v?: number | string): number => {
      if (!v) return 0;
      if (typeof v === "number") return v;
      const match = v.toString().match(/[\d.]+/);
      return match ? parseFloat(match[0]) : 0;
    };

    const cal = parseVal(recipeNutrition.calories);
    const carb = parseVal(recipeNutrition.carbs);
    const fat = parseVal(recipeNutrition.fats);
    const prot = parseVal(recipeNutrition.protein);

    // Single recipe exceeds threshold if it accounts for > 45% of daily goal
    const exceedsCalories = goals.calories > 0 && cal > goals.calories * 0.45;
    const exceedsCarbs = goals.carbs > 0 && carb > goals.carbs * 0.45;
    const exceedsFats = goals.fats > 0 && fat > goals.fats * 0.45;
    const exceedsProtein = goals.protein > 0 && prot > goals.protein * 0.6; // High protein is usually safe, but check

    const reasons: string[] = [];
    if (exceedsCalories) reasons.push(`${Math.round(cal)} kcal (>45% da meta diária)`);
    if (exceedsCarbs) reasons.push(`${Math.round(carb)}g carboidratos (>45% da meta)`);
    if (exceedsFats) reasons.push(`${Math.round(fat)}g gorduras (>45% da meta)`);

    return {
      exceedsCalories,
      exceedsCarbs,
      exceedsFats,
      exceedsProtein,
      anyExceeded: exceedsCalories || exceedsCarbs || exceedsFats,
      reason: reasons.join(", "),
    };
  };

  return (
    <GoalContext.Provider value={{ goals, setGoals: updateGoals, loading, checkRecipeExceedsThreshold }}>
      {children}
    </GoalContext.Provider>
  );
}

export const useGoals = () => useContext(GoalContext);
