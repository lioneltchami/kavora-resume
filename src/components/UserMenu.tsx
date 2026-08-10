"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(session?.user ?? null),
    );
    return () => subscription.unsubscribe();
  }, []);

  if (!user) return null;

  const initial = (user.email?.[0] || "U").toUpperCase();
  const avatar = user.user_metadata?.avatar_url;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {avatar ? (
        <img
          src={avatar}
          alt=""
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1px solid var(--color-rule)",
          }}
        />
      ) : (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--color-ink)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          {initial}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a
          href="/my-resumes"
          style={{
            fontSize: "0.7rem",
            color: "var(--color-ink-2)",
            textDecoration: "none",
          }}
        >
          My Resumes
        </a>
        <a
          href="/create/portfolio"
          style={{
            fontSize: "0.7rem",
            color: "var(--color-accent)",
            textDecoration: "none",
          }}
        >
          Portfolio
        </a>
      </div>
      <form>
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
          style={{
            fontSize: "0.7rem",
            color: "var(--color-ink-2)",
            background: "none",
            border: "none",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
