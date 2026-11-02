import React, { createContext, useContext, useState, useEffect } from "react";

export type CookingPace = "slow" | "normal" | "fast";

interface PaceContextType {
  pace: CookingPace;
  setPace: (pace: CookingPace) => void;
  speechRate: number; // 0.8, 1.0, 1.25
  recognitionSensitivity: number; // timeout tolerance multiplier
}

const PaceContext = createContext<PaceContextType>({
  pace: "normal",
  setPace: () => {},
  speechRate: 1.0,
  recognitionSensitivity: 1.0,
});

export function PaceProvider({ children }: { children: React.ReactNode }) {
  const [pace, setPaceState] = useState<CookingPace>(() => {
    const saved = localStorage.getItem("cooking_pace");
    return (saved as CookingPace) || "normal";
  });

  const setPace = (newPace: CookingPace) => {
    setPaceState(newPace);
    localStorage.setItem("cooking_pace", newPace);
  };

  const speechRate = pace === "slow" ? 0.8 : pace === "fast" ? 1.25 : 1.0;
  const recognitionSensitivity = pace === "slow" ? 1.5 : pace === "fast" ? 0.8 : 1.0;

  return (
    <PaceContext.Provider value={{ pace, setPace, speechRate, recognitionSensitivity }}>
      {children}
    </PaceContext.Provider>
  );
}

export const usePace = () => useContext(PaceContext);
