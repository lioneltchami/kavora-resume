import { headers } from "next/headers";
import { SITE_URL } from "@/lib/site";

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function isLocalHost(host: string): boolean {
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

/**
 * Absolute origin for building auth callback / checkout return URLs.
 *
 * `origin` is missing on some proxied server-action requests, so the forwarded
 * host is preferred. `NEXT_PUBLIC_SITE_URL` wins on deployed environments so
 * OAuth always lands on the domain allow-listed in Supabase, while local dev
 * still uses the real localhost port.
 */
export async function getSiteOrigin(): Promise<string> {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host");
  const host = forwardedHost ?? h.get("host");

  if (host && isLocalHost(host)) {
    return `http://${host}`;
  }

  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    return stripTrailingSlash(configured);
  }

  if (host) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  const origin = h.get("origin");
  if (origin) return stripTrailingSlash(origin);

  return SITE_URL;
}
