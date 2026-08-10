import Image from "next/image";
import Link from "next/link";
import AuthProof from "@/components/AuthProof";
import { DEFAULT_POST_AUTH_PATH, safeNextPath } from "@/lib/safe-path";
import {
  requestPasswordReset,
  resendConfirmation,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "./actions";

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

const fieldClass =
  "w-full rounded-[2px] border border-rule bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-2/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

const alertError =
  "mt-6 border border-red-200 bg-red-50 px-4 py-3 text-left text-sm text-red-700";
const alertOk =
  "mt-6 border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-sm text-emerald-700";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
    next?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const error = params.error;
  const message = params.message;
  const next = safeNextPath(params.next);
  const view = params.view === "forgot" ? "forgot" : "sign-in";
  const continuing = next !== DEFAULT_POST_AUTH_PATH || Boolean(params.next);
  const awaitingConfirm =
    message === "check-email" || message === "check-email-resent";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <nav className="site-nav" aria-label="Site">
        <Link href="/" className="site-nav__brand">
          <Image src="/kavora-logo.png" alt="" width={18} height={15} />
          Kavora
        </Link>
      </nav>

      <section className="px-[clamp(1rem,3.5vw,3rem)] py-12 md:py-16">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[minmax(0,24rem)_minmax(0,20rem)]">
          <div className="max-w-md">
            <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
              {view === "forgot"
                ? "Reset password"
                : continuing
                  ? "Sign in to continue"
                  : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-2">
              {view === "forgot"
                ? "Enter the email on your account and we will send a reset link."
                : continuing
                  ? "Your account keeps your resume and portfolio saved. Sign in, or create one free below — it takes a few seconds."
                  : "Sign in to your Kavora account"}
            </p>

            {error === "invalid" && (
              <div className={alertError}>
                Invalid email or password. Please try again.
              </div>
            )}
            {error === "signup" && (
              <div className={alertError}>
                Could not create account. The email may already be registered —
                try signing in instead.
              </div>
            )}
            {error === "auth" && (
              <div className={alertError}>
                We couldn&apos;t finish signing you in. That sign-in link may
                have expired — please try again.
              </div>
            )}
            {error === "oauth" && (
              <div className={alertError}>
                Google sign-in is unavailable right now. Use your email and
                password below, or try again in a moment.
              </div>
            )}
            {error === "reset" && (
              <div className={alertError}>
                Could not send a reset email. Check the address and try again.
              </div>
            )}
            {error === "resend" && (
              <div className={alertError}>
                Could not resend the confirmation email. Check the address and
                try again.
              </div>
            )}

            {message === "check-email" && (
              <div className={alertOk}>
                Check your email to confirm your account, then come back and
                sign in.
              </div>
            )}
            {message === "check-email-resent" && (
              <div className={alertOk}>
                Confirmation email sent again. Check your inbox (and spam
                folder).
              </div>
            )}
            {message === "reset-sent" && (
              <div className={alertOk}>
                If that email is registered, a reset link is on its way. Check
                your inbox and spam folder.
              </div>
            )}

            {awaitingConfirm && (
              <form className="mt-6 space-y-3 border border-rule bg-paper-2 px-4 py-4">
                <input type="hidden" name="next" value={next} />
                <p className="text-left text-xs text-ink-2">
                  Didn&apos;t get the email? Enter your address to resend.
                </p>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className={fieldClass}
                />
                <button
                  formAction={resendConfirmation}
                  type="submit"
                  className="btn-ghost w-full"
                >
                  Resend confirmation email
                </button>
              </form>
            )}

            {view === "forgot" ? (
              <form className="mt-8 space-y-4">
                <input type="hidden" name="next" value={next} />
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs font-medium text-ink-2"
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
                    className={fieldClass}
                  />
                </div>
                <button
                  formAction={requestPasswordReset}
                  type="submit"
                  className="btn-primary w-full"
                >
                  Send reset link
                </button>
                <p className="pt-1 text-left text-sm text-ink-2">
                  <Link
                    href={`/login?next=${encodeURIComponent(next)}`}
                    className="text-ink underline-offset-2 hover:text-accent hover:underline"
                  >
                    Back to sign in
                  </Link>
                </p>
              </form>
            ) : (
              <>
                <form className="mt-8">
                  <input type="hidden" name="next" value={next} />
                  <button
                    formAction={signInWithGoogle}
                    type="submit"
                    className="btn-ghost w-full"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                </form>

                <div className="relative my-7 flex items-center">
                  <div className="flex-1 border-t border-rule" />
                  <span className="px-4 text-xs tracking-wide text-ink-2">
                    or continue with email
                  </span>
                  <div className="flex-1 border-t border-rule" />
                </div>

                <form className="space-y-4">
                  <input type="hidden" name="next" value={next} />
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-xs font-medium text-ink-2"
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
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-xs font-medium text-ink-2"
                      >
                        Password
                      </label>
                      <Link
                        href={`/login?view=forgot&next=${encodeURIComponent(next)}`}
                        className="text-xs text-ink-2 underline-offset-2 hover:text-accent hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="Your password"
                      className={fieldClass}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      formAction={signInWithEmail}
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      Sign in
                    </button>
                    <button
                      formAction={signUpWithEmail}
                      type="submit"
                      className="btn-ghost flex-1"
                    >
                      Create account
                    </button>
                  </div>
                </form>
              </>
            )}

            <p className="mt-10">
              <Link
                href="/"
                className="text-sm text-ink-2 transition-colors hover:text-accent"
              >
                ← Back to home
              </Link>
            </p>
          </div>
          <AuthProof />
        </div>
      </section>
    </main>
  );
}
