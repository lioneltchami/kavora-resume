"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  slug: string;
}

export default function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Record the view and get the count
    async function recordView() {
      try {
        const res = await fetch("/api/view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        setViews(data.views);
      } catch {
        // Silently fail — view counter is non-critical
      }
    }
    recordView();
  }, [slug]);

  if (views === null || views < 2) return null; // Don't show for 0 or 1 views

  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: "0.7rem",
      color: "rgba(255,255,255,0.4)",
      letterSpacing: "0.05em",
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views.toLocaleString()} {views === 1 ? "view" : "views"}
    </div>
  );
}
