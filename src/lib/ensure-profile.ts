import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates the `profiles` row a user needs for Pro status and AI usage counters.
 * `ignoreDuplicates` keeps an existing row (and its `is_pro`) untouched.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: true },
    );

  if (error) {
    console.error("ensureProfile failed:", error.message);
  }
}
