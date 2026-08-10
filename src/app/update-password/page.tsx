import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "../login/actions";

const fieldClass =
  "w-full rounded-[2px] border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-2/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const alertError =
  "mt-6 border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700";

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
    <main className="min-h-screen bg-paper text-ink">
      <nav className="site-nav" aria-label="Site">
        <Link href="/" className="site-nav__brand">
          <Image src="/kavora-logo.png" alt="" width={18} height={15} />
          Kavora
        </Link>
      </nav>

      <section className="px-[clamp(1rem,3.5vw,3rem)] py-12 md:py-16">
        <div className="max-w-md">
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Set a new password
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">
            Choose a password at least 8 characters long, then you&apos;ll be
            signed in.
          </p>

          {error === "short" && (
            <div className={alertError}>
              Password must be at least 8 characters.
            </div>
          )}
          {error === "mismatch" && (
            <div className={alertError}>
              Passwords do not match. Please try again.
            </div>
          )}
          {error === "update" && (
            <div className={alertError}>
              Could not update your password. Please request a new reset link.
            </div>
          )}

          <form className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-ink-2"
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
                className={fieldClass}
              />
            </div>
            <div>
              <label
                htmlFor="confirm"
                className="mb-1.5 block text-xs font-medium text-ink-2"
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
                className={fieldClass}
              />
            </div>
            <button
              formAction={updatePassword}
              type="submit"
              className="btn-primary w-full"
            >
              Save password
            </button>
          </form>

          <p className="mt-10">
            <Link
              href="/login"
              className="text-sm text-ink-2 transition-colors hover:text-accent"
            >
              ← Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
