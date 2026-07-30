"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/ensure-profile";
import { safeNextPath } from "@/lib/safe-path";
import { getSiteOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";

function loginUrl(params: Record<string, string>): string {
	const search = new URLSearchParams(params);
	return `/login?${search.toString()}`;
}

function readNext(formData: FormData): string {
	return safeNextPath(formData.get("next") as string | null);
}

export async function signInWithEmail(formData: FormData) {
	const next = readNext(formData);
	const supabase = await createClient();

	const { data, error } = await supabase.auth.signInWithPassword({
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	});

	if (error || !data.user) {
		redirect(loginUrl({ error: "invalid", next }));
	}

	await ensureProfile(supabase, data.user.id);

	revalidatePath("/", "layout");
	redirect(next);
}

export async function signUpWithEmail(formData: FormData) {
	const next = readNext(formData);
	const supabase = await createClient();
	const origin = await getSiteOrigin();

	const { data, error } = await supabase.auth.signUp({
		email: formData.get("email") as string,
		password: formData.get("password") as string,
		options: {
			emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
		},
	});

	if (error) {
		redirect(loginUrl({ error: "signup", next }));
	}

	// Email confirmation disabled in Supabase — the user is already signed in.
	if (data.session && data.user) {
		await ensureProfile(supabase, data.user.id);
		revalidatePath("/", "layout");
		redirect(next);
	}

	redirect(loginUrl({ message: "check-email", next }));
}

export async function signInWithGoogle(formData: FormData) {
	const next = readNext(formData);
	const supabase = await createClient();
	const origin = await getSiteOrigin();

	const { data, error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
		},
	});

	if (error || !data.url) {
		redirect(loginUrl({ error: "oauth", next }));
	}

	redirect(data.url);
}

export async function signOut() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	revalidatePath("/", "layout");
	redirect("/");
}

export async function requestPasswordReset(formData: FormData) {
	const email = (formData.get("email") as string | null)?.trim() ?? "";
	const next = readNext(formData);
	const supabase = await createClient();
	const origin = await getSiteOrigin();

	if (!email) {
		redirect(loginUrl({ view: "forgot", error: "reset", next }));
	}

	// Always show success so we don't leak whether an email is registered.
	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/update-password")}`,
	});

	if (error) {
		console.error("Password reset request failed:", error.message);
		redirect(loginUrl({ view: "forgot", error: "reset", next }));
	}

	redirect(loginUrl({ message: "reset-sent", next }));
}

export async function resendConfirmation(formData: FormData) {
	const email = (formData.get("email") as string | null)?.trim() ?? "";
	const next = readNext(formData);
	const supabase = await createClient();
	const origin = await getSiteOrigin();

	if (!email) {
		redirect(loginUrl({ message: "check-email", error: "resend", next }));
	}

	const { error } = await supabase.auth.resend({
		type: "signup",
		email,
		options: {
			emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
		},
	});

	if (error) {
		console.error("Resend confirmation failed:", error.message);
		redirect(loginUrl({ message: "check-email", error: "resend", next }));
	}

	redirect(loginUrl({ message: "check-email-resent", next }));
}

export async function updatePassword(formData: FormData) {
	const password = formData.get("password") as string | null;
	const confirm = formData.get("confirm") as string | null;
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(loginUrl({ error: "auth", next: "/update-password" }));
	}

	if (!password || password.length < 8) {
		redirect("/update-password?error=short");
	}

	if (password !== confirm) {
		redirect("/update-password?error=mismatch");
	}

	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		console.error("Password update failed:", error.message);
		redirect("/update-password?error=update");
	}

	revalidatePath("/", "layout");
	redirect("/my-resumes");
}
