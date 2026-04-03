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

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a
          href="/pricing"
          style={{
            fontSize: "0.75rem",
            color: "#6b6560",
            textDecoration: "none",
          }}
        >
          Pricing
        </a>
        <div style={{ width: 60, height: 20 }} />
      </div>
    );
  }

  if (user) {
    const avatar = user.user_metadata?.avatar_url;
    const initial = (user.email?.[0] || "U").toUpperCase();

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a
          href="/pricing"
          style={{
            fontSize: "0.75rem",
            color: "#6b6560",
            textDecoration: "none",
          }}
        >
          Pricing
        </a>
        <a
          href="/create/portfolio"
          style={{
            fontSize: "0.75rem",
            color: "#6b6560",
            textDecoration: "none",
          }}
        >
          Portfolio
        </a>
        <a
          href="/create"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.75rem",
            fontWeight: 500,
            color: "#b08d57",
            textDecoration: "none",
            padding: "6px 14px",
            border: "1px solid #b08d57",
            borderRadius: 2,
          }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt=""
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
              }}
            />
          ) : (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#1e2a3a",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.6rem",
                fontWeight: 600,
              }}
            >
              {initial}
            </div>
          )}
          Resume Editor
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <a
        href="/pricing"
        style={{
          fontSize: "0.75rem",
          color: "#6b6560",
          textDecoration: "none",
        }}
      >
        Pricing
      </a>
      <a
        href="/login"
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          color: "#b08d57",
          textDecoration: "none",
          padding: "6px 14px",
          border: "1px solid #b08d57",
          borderRadius: 2,
        }}
      >
        Sign In
      </a>
    </div>
  );
}
