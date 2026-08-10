import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";

export const metadata = {
  title: "Get Started — Kavora",
  description:
    "Choose how you'd like to build your professional presence. Start with a resume, a portfolio, or both.",
};

const paths = [
  {
    href: "/create",
    title: "Resume only",
    body: "ATS-optimized resume. PDF download and share at /r/your-name.",
    points: [
      "Live preview",
      "4 layouts · 6 palettes",
      "ATS-safe PDF",
      "Share at /r/your-name",
    ],
    cta: "Start building",
    recommended: false,
  },
  {
    href: "/create?intent=both",
    title: "Resume + portfolio",
    body: "Full package. Resume first, then portfolio — both free to start.",
    points: [
      "Everything in Resume only",
      "Portfolio at /p/your-name",
      "Projects with images",
      "Contact form",
    ],
    cta: "Build both",
    recommended: true,
  },
  {
    href: "/create/portfolio",
    title: "Portfolio only",
    body: "Showcase projects and get discovered. Add a resume later.",
    points: [
      "Portfolio at /p/your-name",
      "Up to 3 projects free",
      "Bio & social links",
      "Add resume any time",
    ],
    cta: "Create portfolio",
    recommended: false,
  },
];

export default function GetStartedPage() {
  return (
    <SiteChrome backHref="/" backLabel="← Home">
      <section className="px-[clamp(1rem,3.5vw,3rem)] py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="text-display-s text-ink">
            What do you want to build?
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-ink-2">
            Start with what you need. You can add the other later — both are in
            your free account.
          </p>

          <div className="mt-12 flex flex-col">
            {paths.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="group feature-row no-underline transition-colors hover:bg-paper-2/60"
              >
                <div>
                  <h2 className="feature-row__title">
                    {path.title}
                    {path.recommended ? (
                      <span className="ml-2 align-middle font-mono text-xs font-normal text-accent">
                        recommended
                      </span>
                    ) : null}
                  </h2>
                </div>
                <div>
                  <p className="feature-row__body">{path.body}</p>
                  <ul className="mt-3 space-y-1">
                    {path.points.map((item) => (
                      <li key={item} className="text-xs text-ink-2">
                        — {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-sm font-medium text-ink group-hover:text-accent">
                    {path.cta} →
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <p className="mt-10 text-xs text-ink-2">
            Free to start. No card.{" "}
            <Link
              href="/pricing"
              className="text-ink underline-offset-2 hover:text-accent"
            >
              See what Pro unlocks →
            </Link>
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
