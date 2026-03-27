import Image from "next/image";
import Link from "next/link";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "./actions";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.0 24.0 0 0 0 0 21.56l7.98-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      {/* Subtle top decorative border */}
      <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="w-full max-w-[420px]">
        {/* Card */}
        <div className="animate-fade-in-up rounded-sm border border-border bg-white px-8 py-10 shadow-[0_2px_24px_rgba(0,0,0,0.04)] sm:px-10 sm:py-12">
          {/* Logo + branding */}
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

            {/* Decorative line */}
            <div className="decorative-line mt-5 mb-6" />

            {/* Heading */}
            <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-navy sm:text-4xl">
              Welcome Back
            </h1>
            <p className="mt-2 text-center text-sm leading-relaxed text-text-muted">
              Sign in to your Kavora Resume Builder account
            </p>
          </div>

          {/* Error messages */}
          {error === "invalid" && (
            <div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              Invalid email or password. Please try again.
            </div>
          )}
          {error === "signup" && (
            <div className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              Could not create account. The email may already be registered.
            </div>
          )}

          {/* Success message */}
          {message === "check-email" && (
            <div className="mt-6 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-700">
              Check your email to confirm your account.
            </div>
          )}

          {/* Google Sign In */}
          <form className="mt-8">
            <button
              formAction={signInWithGoogle}
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-sm border border-border bg-white px-4 py-3 text-[0.875rem] font-medium text-navy transition-all hover:-translate-y-px hover:border-border-light hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7 flex items-center">
            <div className="flex-1 border-t border-border-light" />
            <span className="px-4 text-[0.75rem] tracking-wide text-text-muted/60">
              or continue with email
            </span>
            <div className="flex-1 border-t border-border-light" />
          </div>

          {/* Email/password form */}
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-text-muted"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[0.875rem] text-text placeholder:text-text-muted/40 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[0.75rem] font-medium tracking-wide text-text-muted"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Your password"
                className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[0.875rem] text-text placeholder:text-text-muted/40 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                formAction={signInWithEmail}
                type="submit"
                className="flex-1 rounded-sm bg-navy px-4 py-2.5 text-[0.875rem] font-medium text-white transition-all hover:-translate-y-px hover:bg-navy-light hover:shadow-[0_4px_16px_rgba(30,42,58,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Sign In
              </button>
              <button
                formAction={signUpWithEmail}
                type="submit"
                className="flex-1 rounded-sm border border-navy px-4 py-2.5 text-[0.875rem] font-medium text-navy transition-all hover:-translate-y-px hover:bg-navy hover:text-white hover:shadow-[0_4px_16px_rgba(30,42,58,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Create Account
              </button>
            </div>
          </form>
        </div>

        {/* Back to home link */}
        <div className="animate-fade-in animate-delay-2 mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-text-muted/60 transition-colors hover:text-gold"
          >
            <span aria-hidden="true">&larr;</span>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
