import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "../login/actions";

export default async function UpdatePasswordPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const { error } = await searchParams;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login?error=auth&next=%2Fupdate-password");
	}

	return (
		<main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
			<div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

			<div className="w-full max-w-[420px]">
				<div className="animate-fade-in-up rounded-sm border border-border bg-white px-8 py-10 shadow-[0_2px_24px_rgba(0,0,0,0.04)] sm:px-10 sm:py-12">
					<div className="flex flex-col items-center">
						<Image
							src="/kavora-logo.png"
							alt="Kavora Systems"
							width={36}
							height={32}
							className="opacity-80"
						/>
						<p className="mt-3 text-[0.6875rem] font-medium tracking-[0.3em] uppercase text-gold">
							Resume Builder
						</p>
						<div className="decorative-line mt-5 mb-6" />
						<h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-navy sm:text-4xl">
							Set a New Password
						</h1>
						<p className="mt-2 text-center text-sm leading-relaxed text-text-muted">
							Choose a password at least 8 characters long, then you&apos;ll be
							signed in.
						</p>
					</div>

					{error === "short" && (
						<div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
							Password must be at least 8 characters.
						</div>
					)}
					{error === "mismatch" && (
						<div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
							Passwords do not match. Please try again.
						</div>
					)}
					{error === "update" && (
						<div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
							Could not update your password. Please request a new reset link.
						</div>
					)}

					<form className="mt-8 space-y-4">
						<div>
							<label
								htmlFor="password"
								className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-text-muted"
							>
								New password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								placeholder="At least 8 characters"
								className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[0.875rem] text-text placeholder:text-text-muted/40 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
							/>
						</div>
						<div>
							<label
								htmlFor="confirm"
								className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-text-muted"
							>
								Confirm password
							</label>
							<input
								id="confirm"
								name="confirm"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								placeholder="Repeat your password"
								className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[0.875rem] text-text placeholder:text-text-muted/40 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
							/>
						</div>
						<button
							formAction={updatePassword}
							type="submit"
							className="mt-2 w-full rounded-sm bg-navy px-4 py-2.5 text-[0.875rem] font-medium text-white transition-all hover:-translate-y-px hover:bg-navy-light hover:shadow-[0_4px_16px_rgba(30,42,58,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
						>
							Save Password
						</button>
					</form>
				</div>

				<div className="mt-6 text-center">
					<Link
						href="/login"
						className="inline-flex items-center gap-1.5 text-[0.8125rem] text-text-muted/60 transition-colors hover:text-gold"
					>
						<span aria-hidden="true">&larr;</span>
						Back to sign in
					</Link>
				</div>
			</div>
		</main>
	);
}
