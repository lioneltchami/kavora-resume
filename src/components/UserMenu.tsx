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
            border: "1px solid #e8e2da",
          }}
        />
      ) : (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "#1e2a3a",
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
            color: "#6b6560",
            textDecoration: "none",
          }}
        >
          My Resumes
        </a>
        <a
          href="/create/portfolio"
          style={{
            fontSize: "0.7rem",
            color: "#b08d57",
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
            color: "#6b6560",
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
