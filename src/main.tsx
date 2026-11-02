import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { GoalProvider } from "./context/GoalContext";
import { PaceProvider } from "./context/PaceContext";
import { PantryProvider } from "./context/PantryContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <SubscriptionProvider>
            <GoalProvider>
              <PaceProvider>
                <PantryProvider>
                  <App />
                </PantryProvider>
              </PaceProvider>
            </GoalProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
