import { createClient } from "@/lib/supabase/server";

export async function checkUserPro(): Promise<{
  isPro: boolean;
  userId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isPro: false, userId: null };
  }

  const { data } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("user_id", user.id)
    .single();

  return {
    isPro: data?.is_pro === true,
    userId: user.id,
  };
}
