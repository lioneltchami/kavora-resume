/** Quiet right-column proof for auth util pages — Tier-A type only. */
export default function AuthProof() {
  return (
    <aside
      className="hidden border border-rule bg-paper-2 p-6 md:block md:p-8"
      aria-label="What you get"
    >
      <p className="font-mono text-xs text-ink-2">kavoraresume.cv</p>
      <p className="mt-4 font-display text-xl font-semibold text-ink">
        Resume + portfolio. One account.
      </p>
      <ul className="mt-6 space-y-4">
        <li className="border-b border-rule pb-4">
          <p className="font-mono text-xs text-accent">/r/you</p>
          <p className="mt-1 text-sm text-ink">Public resume page</p>
        </li>
        <li className="border-b border-rule pb-4">
          <p className="font-mono text-xs text-accent">/p/you</p>
          <p className="mt-1 text-sm text-ink">Portfolio with contact</p>
        </li>
        <li>
          <p className="font-mono text-xs text-accent">Free to start</p>
          <p className="mt-1 text-sm text-ink">Sign in keeps your work saved</p>
        </li>
      </ul>
    </aside>
  );
}
