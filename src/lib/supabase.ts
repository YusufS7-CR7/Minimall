import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://pptastuhmpzdyjeyhfts.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
