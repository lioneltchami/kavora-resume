import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Kavora Resume Builder",
  description:
    "Read the terms and conditions governing your use of Kavora Resume Builder.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-[700px] px-6 py-16 md:py-24">
        {/* Back link */}
        <Link
          href="/"
          className="mb-12 inline-flex items-center gap-2 text-sm text-text-muted/70 transition-colors hover:text-gold"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Title */}
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-semibold tracking-tight text-navy md:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-4 text-sm text-text-muted/70">
          Effective Date: March 27, 2026
        </p>

        <div className="mt-2 h-px w-16 bg-gold/40" />

        {/* Content */}
        <div className="mt-12 space-y-10 text-[0.9375rem] leading-relaxed text-text-muted">
          {/* 1 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Kavora Resume Builder (the
              &ldquo;Service&rdquo;), operated by Kavora Systems
              (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), you
              agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;).
              If you do not agree to these Terms, you may not use the Service.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              2. Description of Service
            </h2>
            <p>
              Kavora Resume Builder is an AI-powered platform that enables users
              to create, edit, and manage professional resumes and cover
              letters. The Service includes features such as resume generation,
              AI-driven content suggestions, ATS (Applicant Tracking System)
              optimization, shareable resume links, and PDF export.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              3. User Accounts
            </h2>
            <p>
              To use certain features of the Service, you must create an
              account. You must be at least 18 years of age to create an
              account. You are responsible for maintaining the confidentiality
              of your account credentials and for all activities that occur
              under your account. You agree to notify us immediately of any
              unauthorized use of your account.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              4. User Content
            </h2>
            <p>
              You retain full ownership of all content you create, upload, or
              input into the Service, including your resume data, cover letters,
              and personal information (&ldquo;User Content&rdquo;). We do not
              claim any ownership rights over your User Content. By using the
              Service, you grant us a limited license to process your User
              Content solely for the purpose of providing and improving the
              Service.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              5. Acceptable Use
            </h2>
            <p className="mb-3">You agree not to use the Service to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Create, upload, or distribute content that is illegal,
                fraudulent, defamatory, or otherwise objectionable.
              </li>
              <li>
                Impersonate another person or misrepresent your identity or
                qualifications.
              </li>
              <li>
                Engage in automated scraping, data mining, or any form of
                unauthorized automated access to the Service.
              </li>
              <li>
                Attempt to interfere with, compromise, or disrupt the Service or
                its underlying infrastructure.
              </li>
              <li>
                Use the Service for any purpose that violates applicable laws or
                regulations.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              6. AI-Generated Content
            </h2>
            <p>
              The Service uses artificial intelligence to generate suggestions,
              improvements, and content for your resumes and cover letters.
              AI-generated content is provided as a starting point and may not
              always be accurate, complete, or appropriate for your specific
              situation. You are solely responsible for reviewing, editing, and
              verifying all content before using it in any professional or
              official context. We make no warranties regarding the accuracy or
              suitability of AI-generated content.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              7. Payments and Refunds
            </h2>
            <p>
              Certain features of the Service require a one-time payment. All
              payments are processed securely through Stripe. Once a paid
              feature has been activated on your account, the payment is
              generally non-refundable. However, we may grant refunds at our
              discretion in cases of technical issues, billing errors, or other
              reasonable circumstances. If you believe you are entitled to a
              refund, please contact us.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              8. Intellectual Property
            </h2>
            <p>
              The Service, including its design, code, features, branding, and
              all related intellectual property, is owned by Kavora Systems and
              protected by applicable intellectual property laws. You may not
              copy, modify, distribute, or reverse engineer any part of the
              Service. As stated in Section 4, you retain ownership of your User
              Content.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              9. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Kavora Systems
              and its officers, directors, employees, and agents shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of profits,
              data, or goodwill, arising out of or related to your use of the
              Service. Our total aggregate liability for any claims arising
              under these Terms shall not exceed the amount you paid to us in
              the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              10. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account and
              access to the Service at our discretion if you violate these Terms
              or engage in conduct that we reasonably believe is harmful to the
              Service or other users. You may delete your account at any time.
              Upon termination, your right to use the Service ceases
              immediately, and we may delete your data in accordance with our
              Privacy Policy.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of Canada, without regard to its conflict of law
              provisions. Any disputes arising under these Terms shall be
              resolved in the courts of competent jurisdiction in Canada.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              12. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. When we do, we will
              revise the &ldquo;Effective Date&rdquo; at the top of this page.
              Your continued use of the Service after changes are posted
              constitutes your acceptance of the revised Terms.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="font-[family-name:var(--font-cormorant)] mb-3 text-xl font-semibold text-navy">
              13. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-3 font-medium text-navy">
              Kavora Systems
              <br />
              <a
                href="mailto:contact@kavorasystems.com"
                className="text-gold underline decoration-gold/30 underline-offset-2 hover:decoration-gold"
              >
                contact@kavorasystems.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
