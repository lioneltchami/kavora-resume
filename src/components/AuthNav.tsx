"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  const link =
    "text-sm text-ink-2 no-underline whitespace-nowrap hover:text-ink transition-colors";

  if (loading) {
    return (
      <>
        <a href="/pricing" className={link}>
          Pricing
        </a>
        <span className={`${link} opacity-45`} aria-hidden>
          Sign in
        </span>
      </>
    );
  }

  if (user) {
    return (
      <>
        <a href="/pricing" className={link}>
          Pricing
        </a>
        <a href="/my-resumes" className={link}>
          My resumes
        </a>
        <a href="/create" className={link}>
          Editor
        </a>
      </>
    );
  }

  return (
    <>
      <a href="/pricing" className={link}>
        Pricing
      </a>
      <a href="/login" className={link}>
        Sign in
      </a>
    </>
  );
}
