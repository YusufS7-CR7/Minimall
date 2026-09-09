import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pptastuhmpzdyjeyhfts.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from("products").select("count");
  if (error) {
    console.error("Connection error:", error);
  } else {
    console.log("Successfully connected! Products count query returned:", data);
  }
}

check();
