export const SITE_DOMAIN = "kavoraresume.cv";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`
).replace(/\/$/, "");
