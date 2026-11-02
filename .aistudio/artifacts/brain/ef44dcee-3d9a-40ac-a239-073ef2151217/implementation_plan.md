# Caderno de Receitas - Feature Enhancements Implementation Plan

Comprehensive implementation strategy for expanding Caderno de Receitas with smart AI shopping categorization, nutrition goal tracking with threshold alerts, global cooking pace controls, bulk buy ingredient insights, weekly meal planning, hands-free voice search, and a pantry expiration prevention system.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions incorporate choices confirmed in Phase 1:

- **Confirmed Decision 1 (Cooking Pace Scope)**: Cooking Pace toggle configured as a **Global Preference** (accessible in Settings & Profile menu) that dynamically adjusts text-to-speech speed and speech recognition sensitivity across all step-by-step recipe instruction views.
- **Confirmed Decision 2 (Bulk Buy Identification)**: Bulk Buy detection evaluates **Recipe History** and saved collections to highlight ingredients used across multiple recipes in high cumulative volume.
- **Confirmed Decision 3 (Weekly Meal Planner Layout)**: Weekly schedule rendered in a clean, structured **Daily List View** breaking down Monday through Sunday with meal slot cards (Café da Manhã, Almoço, Jantar, Lanches) and drag-and-drop / selector affordances.

---

## 1. Overview & Core Concept

**Caderno de Receitas** is an all-in-one culinary assistant and meal planning web application. This update introduces seven core features:

1. **Smart Aisle Categorization**: Shopping list items are automatically assigned to supermarket aisles (Produce, Dairy, Pantry, Butchery, Bakery, Beverages, Household) using local keyword intelligence backed by server-side Gemini 3.8 Flash categorization.
2. **Nutritional Intake Goals & Excess Badges**: Users set daily calorie and macro limits (Protein, Carbs, Fats). Dashboard and Recipe cards show alert badges if single recipes or daily planned menus breach calorie or macro thresholds.
3. **Global Cooking Pace Toggle**: A persistent pace controller (Slow / Medium / Fast) that tunes SpeechSynthesis rate (0.8x to 1.25x) and SpeechRecognition timeout tolerances.
4. **Bulk Buy Analyzer**: Scans saved recipes and shopping list items for repeated ingredient usage, flagging items that are economical to purchase in bulk.
5. **Weekly Meal Planner (Daily List Layout)**: Interactive scheduling interface allowing drag-and-drop or quick assignment of recipes to daily time slots with direct shopping list aggregation.
6. **Global Voice Search**: Hands-free search bar supporting natural language voice input for filtering recipes by ingredient, cuisine (e.g. "Italiana", "Nordestina"), or diet ("vegano", "low carb").
7. **Pantry Staples Expiration Tracker**: Track pantry inventory with entry dates and estimated shelf life. Visual indicators flag items nearing expiration and suggest recipes to use them up.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Palette**: Warm culinary aesthetic anchored on terracotta (`#C85A32`), warm sand (`#F9F6F0`), charcoal ink (`#2B2825`), and fresh sage green accents (`#4A7C59`).
- **Typography**: Clean, accessible sans-serif typography (`Plus Jakarta Sans` / `DM Sans`) paired with tabular numbers (`tabular-nums`) for nutrition data and pantry expiration counters.
- **Micro-Interactions**: Smooth hover elevations on recipe cards, subtle pulse indicators on expiring pantry items, and interactive audio waveform animations during voice search.

### Key Workflows
1. **Shopping & Aisle Navigation**: User adds ingredients from recipes or manual entry. Items sort automatically by aisle headers with checkbox toggles and a highlighted "Bulk Buy Savings" banner.
2. **Dashboard & Caloric Guardrails**: Caloric Goal widget on the home dashboard shows real-time daily progress. Recipes exceeding 40% of daily caloric allowance show a subtle "Aviso Calórico" badge.
3. **Pantry Management & Recipe Matching**: Pantry view lists items with days-left countdowns. Expiring items present a single-click "Sugerir Receita" button that filters catalog items containing those ingredients.
4. **Meal Planning (Daily List View)**: Monday–Sunday vertical accordions list planned dishes with direct macros summation per day and "Adicionar Todos à Lista de Compras".

---

## 3. Key Technical & Architectural Decisions

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React SPA Client (Vite)                         │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────┐ │
│  │   AuthContext / User   │  │ GoalContext (Macros) │  │ Pace Context│ │
│  └───────────┬───────────┘  └──────────┬───────────┘  └──────┬──────┘ │
│              │                         │                     │        │
│  ┌───────────▼─────────────────────────▼─────────────────────▼──────┐ │
│  │  App Router (Home, ShoppingList, MealPlanner, Pantry, Profile)   │ │
│  └───────────┬───────────────────────────────────────────────┬──────┘ │
└──────────────┼───────────────────────────────────────────────┼────────┘
               │ HTTP API Calls                                │ Supabase Sync
┌──────────────▼────────────────┐            ┌─────────────────▼────────┐
│   Node.js Express Proxy Server│            │    Supabase Firestore/   │
│   (server.ts) + Gemini SDK    │            │  Database (User Data)    │
│  - /api/nutrition             │            │  - user_goals            │
│  - /api/categorize-items      │            │  - shopping_list         │
│  - /api/suggest-substitution  │            │  - pantry_items          │
└───────────────────────────────┘            └──────────────────────────┘
```

1. **State Persistence Strategy**:
   - `GoalContext`: Stores goals in `user_goals` table via Supabase with fallback to local state.
   - `PaceContext`: Persists global pace preference (`slow` | `normal` | `fast`) in `localStorage` and profile state.
   - `PantryItems`: Persisted in Supabase table `pantry_items` (or IndexedDB cache when offline).
2. **Voice Search & Speech Synthesis**:
   - Speech recognition utilizes native browser `webkitSpeechRecognition` / `SpeechRecognition` with auto-language detection (`pt-BR`).
   - TTS uses `SpeechSynthesisUtterance` with speed rate calculated dynamically: `Slow = 0.8`, `Normal = 1.0`, `Fast = 1.25`.
3. **Shopping List Aisle Mapping & Bulk Buy Engine**:
   - Client-side deterministic heuristic maps common Portuguese food items to 7 distinct aisles.
   - Unrecognized items call `/api/categorize-items` on `server.ts` powered by `@google/genai` `gemini-3.8-flash`.
   - Bulk Buy analyzer aggregates total quantities and flags items appearing in $\ge 2$ recipes or with quantity $> 1\text{kg}$ / $3\text{ units}$.

---

## 4. Step-by-Step Implementation Roadmap

### Phase 1: Context & Core Utilities
- Create `PaceContext` (`src/context/PaceContext.tsx`) for global cooking pace controls.
- Enhance `GoalContext` (`src/context/GoalContext.tsx`) with macro target calculations and threshold check helpers (`isRecipeExceedingGoal`).
- Create `PantryContext` / service (`src/lib/pantry.ts`) for managing pantry items, entry dates, expiration calculations, and recipe recommendation matching.

### Phase 2: Shopping List & Bulk Buy Enhancements
- Upgrade `ShoppingList.tsx` with:
  - 7 Supermarket Aisle groupings with collapse/expand sections.
  - Automatic aisle detection (local dictionary + backend Gemini API fallback).
  - "Bulk Buy" (Comprar em Atacado) smart badges for repeated ingredients.
  - Clear checked items & export functionality.

### Phase 3: Dashboard & Caloric Threshold Alerts
- Update `Home.tsx` and `ItemCard.tsx`:
  - Display Daily Caloric & Macro summary bar on Dashboard.
  - Add calorie warning badges on recipes exceeding configured goal thresholds.
  - Implement Global Voice Search trigger in Search Bar with microphone visual feedback.

### Phase 4: Weekly Meal Planner (Daily List Layout)
- Refactor `MealPlanner.tsx`:
  - Daily list layout (Monday through Sunday).
  - Drag-and-drop or select-to-add recipe slots for Breakfast, Lunch, Dinner, Snack.
  - Daily macro totals comparison against user goals.
  - One-click "Adicionar Ingredientes da Semana à Lista de Compras".

### Phase 5: Step-by-Step Cooking View & Pace Integration
- Update `ItemDetail.tsx`:
  - Integrates global Cooking Pace setting to set text-to-speech reading rate and voice recognition sensitivity.
  - Step-by-step hands-free navigation commands ("próximo", "voltar", "repetir").

### Phase 6: Pantry Expiration Tracker & Recipe Suggestions
- Create `Pantry.tsx` page & navigation item:
  - Add staple items with purchase/entry date and shelf-life days.
  - Status badges: Fresh (Verde), Expiring Soon (Amarelo, $\le 3$ days), Expired (Vermelho).
  - Quick action: "Receitas com este ingrediente" filtering the catalog instantly.

---

## 5. Verification & Testing Strategy

1. **Compilation Check**: Run `npm run build` / `compile_applet` to ensure zero TypeScript or Vite bundle errors.
2. **Shopping List Aisle & Bulk Buy**: Test adding multiple ingredients (e.g. 2x queijo, leite, farinha) and verify proper grouping under Laticínios and Mercearia, with Bulk Buy highlights.
3. **Voice Search & Cooking Pace**: Verify microphone voice recognition sets search query and TTS speed adjusts cleanly between Slow (0.8x) and Fast (1.25x).
4. **Pantry Expiration**: Create sample staples with past entry dates and verify correct alert badges and suggested recipes.
