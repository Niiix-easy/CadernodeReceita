import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && key);
// Valores de reserva evitam que o app quebre na importação quando o .env não foi preenchido.
export const supabase = createClient(url || "http://localhost:54321", key || "chave-ausente");
