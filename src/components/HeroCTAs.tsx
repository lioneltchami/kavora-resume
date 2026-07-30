"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HeroCTAs() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <div className="animate-fade-in-up animate-delay-4 mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <Link href="/get-started" className="btn-primary">
          Get Started Free
          <span className="text-gold-light" aria-hidden="true">
            &rarr;
          </span>
        </Link>
        <Link href="/r/reena" className="btn-secondary">
          See Resume Example
        </Link>
        {signedIn && (
          <Link href="/my-resumes" className="btn-secondary">
            My Resumes
          </Link>
        )}
      </div>
      <div className="animate-fade-in-up animate-delay-4 mt-4">
        <Link
          href="/p/reena"
          className="text-sm font-medium text-gold transition-colors hover:text-navy"
        >
          See Portfolio Example &rarr;
        </Link>
      </div>
    </>
  );
}
