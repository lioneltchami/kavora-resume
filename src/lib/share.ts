export function resumeShareText(name?: string): string {
  const who = (name ?? "").trim();
  if (who) {
    return `Check out ${who}'s professional resume, built with Kavora Resume Builder.`;
  }
  return "Check out my professional resume, built with Kavora Resume Builder.";
}

export function buildLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export function buildWhatsAppShareUrl(url: string, text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
}

export function buildTwitterShareUrl(url: string, text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function buildEmailShareUrl(
  url: string,
  subject: string,
  body: string,
): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${body}\n\n${url}`)}`;
}
