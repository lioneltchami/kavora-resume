"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithEmail(formData: FormData) {
	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	});

	if (error) {
		redirect("/login?error=invalid");
	}

	revalidatePath("/", "layout");
	redirect("/create");
}

export async function signUpWithEmail(formData: FormData) {
	const supabase = await createClient();

	const { error } = await supabase.auth.signUp({
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	});

	if (error) {
		redirect("/login?error=signup");
	}

	revalidatePath("/", "layout");
	redirect("/login?message=check-email");
}

export async function signInWithGoogle() {
	const supabase = await createClient();
	const origin = (await headers()).get("origin");

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${origin}/auth/callback`,
		},
	});

	if (data.url) {
		redirect(data.url);
	}
}

export async function signOut() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/");
}
