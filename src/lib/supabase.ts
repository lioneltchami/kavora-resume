import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!supabaseUrl;

// Legacy client for backward compatibility (client-side only)
export const supabase = supabaseUrl
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : (null as any);
