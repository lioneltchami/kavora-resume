# Plan: ATS Compliance Fixes & Portfolio Website Generator

## Task Description

Two major features for the Kavora Resume Builder SaaS (Next.js 16 + Supabase + Stripe + Claude AI):

**Feature 1: ATS Compliance Fixes** — Fix multi-column PDF layouts that break ATS parsing, add ATS-safe export mode, improve the ATS checker to show how ATS systems actually read the resume, and embed fonts directly in PDF output.

**Feature 2: Portfolio Website Generator** — A complete portfolio website feature at `/p/[slug]` that generates personal portfolio pages from existing resume data plus new project entries. Includes portfolio editor, image uploads via Supabase Storage, testimonials, contact form, view analytics, Pro gating, and pricing update from $9 to $19.

## Objective

When this plan is complete:

1. Every PDF download from Kavora is provably ATS-safe regardless of layout template chosen
2. Users can see exactly how ATS systems read their resume (unique differentiator)
3. Users can create and publish portfolio websites at `/p/[slug]` from their resume data
4. Free users get a basic portfolio (3 projects, Kavora branding); Pro users get full features
5. Pricing is updated to $19 one-time reflecting the added portfolio value
6. All changes are type-safe, SSR-compatible, and follow existing codebase patterns

## Problem Statement

**ATS Problem:** 3 of 4 PDF layout templates (Modern, Compact, Executive) use CSS flexbox/grid multi-column layouts. ATS parsers (Taleo, Workday, Greenhouse, iCIMS) read HTML source order, not visual order. The Modern layout puts sidebar content (skills, education, languages) before work experience in source order, causing ATS to misread the resume narrative. Google Fonts CDN links in PDF HTML may not resolve in offline ATS environments.

**Portfolio Problem:** Kavora currently only creates resumes. The competitive landscape shows no competitor offers both AI resume building AND portfolio website generation at a one-time price. Adding portfolio generation creates a genuine market differentiator and justifies the price increase from $9 to $19.

## Solution Approach

### ATS Fixes

- Add a `buildATSSafeHTML()` function that always renders single-column regardless of layout choice — used for a dedicated "ATS Safe Download" button
- Add "How ATS Reads Your Resume" panel to ATSChecker that extracts and displays text in source order
- Add layout warning banners in the editor when risky layouts are selected
- Embed DM Sans font as base64 @font-face in PDF HTML (replace Google Fonts CDN link)

### Portfolio Feature

- Database: New Supabase tables (portfolio_projects, portfolio_settings, portfolio_testimonials, portfolio_views) with RLS policies
- Storage: New Supabase Storage bucket "portfolio-assets" for project images
- Types: New TypeScript interfaces (PortfolioProject, PortfolioSettings, PortfolioTestimonial)
- Routes: `/p/[slug]` (public page), `/p/[slug]/og` (OG image), `/create/portfolio` (editor)
- APIs: CRUD for projects, settings, testimonials; image upload; view recording
- Components: PortfolioPage, PortfolioEditor, ProjectCard, TestimonialCard, PortfolioPreview
- Pro Gating: Reuse existing ProGate component and check-pro pattern
- Pricing: Update from $9 to $19 across checkout, pricing page, ProGate modal

## Relevant Files

### Existing Files to Modify

- **`src/components/PDFDownload.tsx`** (630 lines) — Add `buildATSSafeHTML()` function, add "ATS Safe Download" button, embed fonts as base64. Contains `buildClassicHTML`, `buildModernHTML`, `buildCompactHTML`, `buildExecutiveHTML` and `esc()` helper.
- **`src/components/ATSChecker.tsx`** (468 lines) — Add "How ATS Reads Your Resume" tab showing extracted text in source order. Currently has `analyzeATS()`, `buildResumeText()`, `ScoreRing`, and modal UI.
- **`src/app/create/page.tsx`** (693 lines) — Add layout warning banner, add portfolio navigation link. Contains `CreatePageInner` with all modal state management and editor layout.
- **`src/lib/types.ts`** (140 lines) — Add PortfolioProject, PortfolioSettings, PortfolioTestimonial interfaces, portfolio category enum, portfolio palettes.
- **`src/app/pricing/page.tsx`** (268 lines) — Update $9 → $19, add portfolio features to Pro feature list, update FAQ.
- **`src/components/ProGate.tsx`** (117 lines) — Update "$9" → "$19" in CTA button text.
- **`src/app/api/checkout/route.ts`** (72 lines) — Update `unit_amount` from `"900"` to `"1900"`, update product name/description to include portfolio.
- **`src/app/api/webhook/route.ts`** (141 lines) — No changes needed (already handles Pro activation correctly).
- **`src/lib/check-pro.ts`** (26 lines) — No changes needed (already returns isPro boolean).
- **`src/app/r/[slug]/page.tsx`** (232 lines) — Reference pattern for `/p/[slug]` page structure (SSR, metadata, privacy check).
- **`src/app/r/[slug]/og/route.tsx`** — Reference pattern for `/p/[slug]/og` OG image generation.
- **`src/components/ResumeForm.tsx`** — Reference pattern for form editing (onChange prop pattern).
- **`src/components/ViewCounter.tsx`** (48 lines) — Reference pattern for view counting on portfolio pages.
- **`src/app/api/view/route.ts`** (60 lines) — Reference pattern for recording views.

### New Files to Create

#### Database & Types

- **`src/lib/portfolio-types.ts`** — PortfolioProject, PortfolioSettings, PortfolioTestimonial interfaces, category enum, defaults
- **`supabase/migrations/001_portfolio_tables.sql`** — SQL migration for all new tables + RLS policies + storage bucket

#### Portfolio Public Page

- **`src/app/p/[slug]/page.tsx`** — SSR portfolio page (follows `/r/[slug]` pattern)
- **`src/app/p/[slug]/og/route.tsx`** — Dynamic OG image for portfolio sharing
- **`src/components/PortfolioPage.tsx`** — Full portfolio page component (Hero, About, Experience, Education, Skills, Projects, Testimonials, Contact)
- **`src/components/PortfolioContactForm.tsx`** — Contact form component for portfolio page

#### Portfolio Editor

- **`src/app/create/portfolio/page.tsx`** — Portfolio editor page (protected route)
- **`src/components/PortfolioEditor.tsx`** — Main portfolio editor with tabs (Projects, Settings, Testimonials, Analytics)
- **`src/components/ProjectEditor.tsx`** — Individual project card editor with image upload
- **`src/components/TestimonialEditor.tsx`** — Testimonial add/edit form
- **`src/components/PortfolioPreview.tsx`** — Live preview panel for portfolio editor

#### API Routes

- **`src/app/api/portfolio/settings/route.ts`** — GET/POST portfolio settings
- **`src/app/api/portfolio/projects/route.ts`** — GET/POST/PUT/DELETE portfolio projects
- **`src/app/api/portfolio/testimonials/route.ts`** — GET/POST/PUT/DELETE testimonials
- **`src/app/api/portfolio/upload/route.ts`** — Image upload to Supabase Storage
- **`src/app/api/portfolio/views/route.ts`** — Record + fetch portfolio view count
- **`src/app/api/portfolio/contact/route.ts`** — Handle contact form submissions

## Implementation Phases

### Phase 1: Foundation (Database + Types + ATS Fixes)

**Database setup**: Create all Supabase tables, RLS policies, and storage bucket. Define TypeScript interfaces for all new data types.

**ATS fixes**: Add ATS-safe PDF export function, embed fonts, add layout warnings, improve ATS checker.

These are independent and can be done in parallel. Phase 2 depends on the database being ready.

### Phase 2: Core Implementation (Portfolio Feature)

**API layer**: Build all CRUD endpoints for portfolio settings, projects, testimonials, image upload, and view tracking.

**Portfolio page**: Build the public `/p/[slug]` page with all sections, dynamic OG images, and responsive design.

**Portfolio editor**: Build the editor UI with tabs, live preview, image upload, and Pro gating.

### Phase 3: Integration & Polish (Pricing + Pro Gating + Polish)

**Pricing update**: Update all price references from $9 to $19, update Stripe checkout amount, update feature lists.

**Pro gating**: Wire up ProGate for portfolio features (>3 projects, testimonials, contact form, branding removal).

**Navigation**: Add portfolio links in the resume editor, my-resumes page, and main navigation.

**Final validation**: Build, lint, type-check, test all routes, verify Pro gating works end-to-end.

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to the building, validating, testing, deploying, and other tasks.
  - This is critical. Your job is to act as a high level director of the team, not a builder.
  - Your role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task\* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task\* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Specialist
  - Name: **db-architect**
  - Role: Design and create all Supabase database tables, RLS policies, storage bucket configuration, and SQL migration files
  - Agent Type: postgres-pro
  - Resume: true

- Specialist
  - Name: **ats-fixer**
  - Role: Fix all ATS compliance issues in PDFDownload.tsx, ATSChecker.tsx, and create/page.tsx — add ATS-safe export, font embedding, layout warnings, ATS text preview
  - Agent Type: fullstack-developer
  - Resume: true

- Specialist
  - Name: **types-architect**
  - Role: Define all new TypeScript interfaces, types, enums, and defaults for the portfolio feature
  - Agent Type: typescript-pro
  - Resume: true

- Specialist
  - Name: **api-builder**
  - Role: Build all portfolio API routes (settings, projects, testimonials, upload, views, contact) following existing patterns from /api/resume and /api/view
  - Agent Type: nextjs-developer
  - Resume: true

- Specialist
  - Name: **portfolio-page-builder**
  - Role: Build the public /p/[slug] portfolio page component with all sections, OG image route, responsive design, scroll animations, and Kavora branding badge for free users
  - Agent Type: frontend-developer
  - Resume: true

- Specialist
  - Name: **portfolio-editor-builder**
  - Role: Build the portfolio editor at /create/portfolio with tabs (Projects, Settings, Testimonials, Analytics), project image upload via react-dropzone, live preview, and Pro gating
  - Agent Type: react-specialist
  - Resume: true

- Specialist
  - Name: **pricing-updater**
  - Role: Update all pricing from $9 to $19 across checkout API, pricing page, ProGate modal, product descriptions, and add portfolio features to the pricing comparison
  - Agent Type: fullstack-developer
  - Resume: true

- Quality Engineer (Validator)
  - Name: **validator**
  - Role: Validate completed work against acceptance criteria (read-only inspection mode) — type-check, build, lint, verify all routes, confirm Pro gating, confirm ATS fixes
  - Agent Type: quality-engineer
  - Resume: false

## Step by Step Tasks

### 1. Define Portfolio TypeScript Types

- **Task ID**: define-types
- **Depends On**: none
- **Assigned To**: types-architect
- **Agent Type**: typescript-pro
- **Parallel**: true (can run alongside tasks 2 and 3)
- Create `src/lib/portfolio-types.ts` with the following interfaces:
  - `PortfolioProject`: id, user_id, slug, title, description, category (enum: 'design' | 'development' | 'marketing' | 'writing' | 'consulting' | 'photography' | 'other'), image_url, live_url, display_order, created_at
  - `PortfolioSettings`: user_id, slug, bio, avatar_url, show_contact_form, show_testimonials, theme_color (reuse palette IDs from existing PALETTES), social_links (object with linkedin, github, twitter, website optional fields), created_at, updated_at
  - `PortfolioTestimonial`: id, user_id, name, role, company, avatar_url, text, display_order, created_at
  - `PortfolioView`: id, slug, viewed_at, user_agent, referrer
  - `PROJECT_CATEGORIES` array constant with label/value pairs
  - `emptyPortfolioSettings` default object (following `emptyResume` pattern)
  - Export all types from the file
- Also add to `src/lib/types.ts`:
  - Add `title?: string` field to the `ResumeData` interface (for portfolio to use as job title/headline)

### 2. Create Database Migration

- **Task ID**: create-db-migration
- **Depends On**: none
- **Assigned To**: db-architect
- **Agent Type**: postgres-pro
- **Parallel**: true (can run alongside tasks 1 and 3)
- Create `supabase/migrations/001_portfolio_tables.sql` with:
  - `portfolio_settings` table:
    - `user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
    - `slug TEXT UNIQUE NOT NULL` (references the user's primary resume slug)
    - `bio TEXT DEFAULT ''`
    - `avatar_url TEXT`
    - `show_contact_form BOOLEAN DEFAULT false`
    - `show_testimonials BOOLEAN DEFAULT false`
    - `theme_color TEXT DEFAULT 'classic-navy'` (matches existing palette IDs)
    - `social_links JSONB DEFAULT '{}'::jsonb`
    - `created_at TIMESTAMPTZ DEFAULT now()`
    - `updated_at TIMESTAMPTZ DEFAULT now()`
  - `portfolio_projects` table:
    - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
    - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
    - `slug TEXT NOT NULL` (links to the portfolio slug)
    - `title TEXT NOT NULL`
    - `description TEXT DEFAULT ''`
    - `category TEXT DEFAULT 'other'`
    - `image_url TEXT`
    - `live_url TEXT`
    - `display_order INT DEFAULT 0`
    - `created_at TIMESTAMPTZ DEFAULT now()`
  - `portfolio_testimonials` table:
    - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
    - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
    - `name TEXT NOT NULL`
    - `role TEXT DEFAULT ''`
    - `company TEXT DEFAULT ''`
    - `avatar_url TEXT`
    - `text TEXT NOT NULL`
    - `display_order INT DEFAULT 0`
    - `created_at TIMESTAMPTZ DEFAULT now()`
  - `portfolio_views` table:
    - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
    - `slug TEXT NOT NULL`
    - `viewed_at TIMESTAMPTZ DEFAULT now()`
    - `user_agent TEXT`
    - `referrer TEXT`
    - Index on (slug, viewed_at) for analytics queries
  - RLS policies for all tables:
    - `portfolio_settings`: Users can SELECT/INSERT/UPDATE their own rows (user_id = auth.uid())
    - `portfolio_projects`: Users can SELECT/INSERT/UPDATE/DELETE their own rows. Public SELECT for published portfolios (where slug matches a public portfolio)
    - `portfolio_testimonials`: Users can CRUD their own rows
    - `portfolio_views`: INSERT open (anyone can record a view), SELECT only by portfolio owner
  - Supabase Storage bucket:
    - Create bucket `portfolio-assets` with 5MB file size limit
    - Accept only image/jpeg, image/png, image/webp
    - RLS: authenticated users can upload to their own folder (user_id prefix), public read for all files
  - Add updated_at trigger function for portfolio_settings

### 3. Fix ATS Compliance Issues

- **Task ID**: fix-ats
- **Depends On**: none
- **Assigned To**: ats-fixer
- **Agent Type**: fullstack-developer
- **Parallel**: true (can run alongside tasks 1 and 2)
- **Modifications to `src/components/PDFDownload.tsx`**:
  - Add a new function `buildATSSafeHTML(data: ResumeData): string` that ALWAYS renders a single-column layout regardless of `data.layoutId`. This should be based on the Classic layout but optimized for maximum ATS parsing compatibility:
    - Single column, no flexbox, no grid
    - Semantic section headers with standard names
    - Source order: Header → Summary → Skills → Experience → Education → Volunteer → Languages
    - No `display: flex` or `display: grid` anywhere
    - No photos (ATS can't parse images)
    - Use embedded base64 DM Sans font (not Google Fonts CDN link)
    - Use system-safe fallback fonts: Arial, Helvetica, sans-serif
  - Add a second download button "Download ATS-Safe PDF" next to the existing "Download PDF" button:
    - The existing button continues to use the user's chosen layout (pretty version)
    - The new button always uses `buildATSSafeHTML()` (ATS-safe version)
    - Style the ATS button with a shield/checkmark icon and green accent to differentiate
  - Embed DM Sans Regular (400) as base64 `@font-face` in the ATS-safe HTML `<style>` block. Fetch the WOFF2 file from Google Fonts, convert to base64, and inline it. If base64 is too large (>100KB), use system fonts only with no Google Fonts dependency.
  - Keep all existing layout functions unchanged (they're the "pretty" versions)
- **Modifications to `src/components/ATSChecker.tsx`**:
  - Add a new tab/section: "How ATS Reads Your Resume"
  - This section extracts the current resume's text content in the EXACT source order that an ATS parser would read it (based on the current layout's HTML structure)
  - For Modern layout: show sidebar content first (Contact → Skills → Languages → Education) then main content (Summary → Experience → Volunteer)
  - For Compact layout: show left column first (Experience) then right column (Skills → Education → Volunteer → Languages)
  - For Classic/Executive: show normal top-to-bottom order
  - Display the extracted text in a monospace code-like block with section headers highlighted
  - Add a warning callout if the layout is Modern/Compact (yellow warning box): "Your current layout may cause ATS systems to read your resume in a different order than intended. Consider using the Classic layout for job applications, or download the ATS-Safe PDF."
- **Modifications to `src/app/create/page.tsx`**:
  - Add an inline warning banner below the header when `data.layoutId` is 'modern', 'compact', or 'executive':
    - Yellow/amber background, warning icon
    - Text: "Heads up: This layout uses multiple columns that some ATS systems may struggle to parse. For job applications, use the 'Download ATS-Safe PDF' button."
    - Dismissible (track in state, not persistent)
    - Only shown on desktop (hidden on mobile since mobile doesn't show layout selector)

### 4. Build Portfolio API Routes

- **Task ID**: build-portfolio-apis
- **Depends On**: define-types, create-db-migration
- **Assigned To**: api-builder
- **Agent Type**: nextjs-developer
- **Parallel**: false (must wait for types and DB)
- Create the following API routes following existing patterns from `src/app/api/resume/route.ts` and `src/app/api/view/route.ts`:
- **`src/app/api/portfolio/settings/route.ts`**:
  - `GET`: Fetch portfolio settings for the authenticated user. Return 401 if not authenticated. Return default settings if none exist.
  - `POST`: Create or update (upsert) portfolio settings. Validate slug uniqueness. Require authentication.
  - Use `createClient()` from `@/lib/supabase/server` (same pattern as existing routes)
- **`src/app/api/portfolio/projects/route.ts`**:
  - `GET`: Fetch all projects for the authenticated user, ordered by display_order. Query param `?slug=xxx` for public access (no auth required, returns only projects for that portfolio slug).
  - `POST`: Create a new project. Require authentication. Check Pro status — if not Pro, limit to 3 projects total (return 403 with message if exceeded). Use `checkUserPro()` from `@/lib/check-pro`.
  - `PUT`: Update a project by ID. Require authentication. Verify ownership.
  - `DELETE`: Delete a project by ID. Require authentication. Verify ownership. Also delete the associated image from Supabase Storage if image_url exists.
- **`src/app/api/portfolio/testimonials/route.ts`**:
  - `GET`: Fetch testimonials for authenticated user. Query param `?slug=xxx` for public access.
  - `POST`: Create testimonial. Require authentication + Pro status (testimonials are Pro-only).
  - `PUT`: Update testimonial. Require authentication + ownership.
  - `DELETE`: Delete testimonial. Require authentication + ownership.
- **`src/app/api/portfolio/upload/route.ts`**:
  - `POST`: Accept multipart form data with a single image file. Validate: max 5MB, accept only image/jpeg, image/png, image/webp. Upload to Supabase Storage bucket `portfolio-assets` in folder `{user_id}/`. Return the public URL. Require authentication.
  - Use `req.formData()` to get the file, then `supabase.storage.from('portfolio-assets').upload()`.
- **`src/app/api/portfolio/views/route.ts`**:
  - `POST`: Record a view (insert into portfolio_views). Accept slug, user_agent, referrer. No auth required.
  - `GET`: Fetch view count and basic analytics (total views, last 30 days views) for a slug. If authenticated and is the portfolio owner, return detailed stats; otherwise return just total count.
- **`src/app/api/portfolio/contact/route.ts`**:
  - `POST`: Accept name, email, message, slug. Validate inputs with Zod. Look up portfolio owner's email from profiles/resumes table. For now, store the message (or use existing email approach if available). Rate limit: max 5 messages per hour per IP (basic, using in-memory or Supabase check). Return success.

### 5. Build Public Portfolio Page

- **Task ID**: build-portfolio-page
- **Depends On**: define-types, build-portfolio-apis
- **Assigned To**: portfolio-page-builder
- **Agent Type**: frontend-developer
- **Parallel**: false (needs types and API routes)
- **Create `src/app/p/[slug]/page.tsx`**:
  - Follow the EXACT pattern from `src/app/r/[slug]/page.tsx`:
    - `getPortfolioData(slug)` helper that fetches from Supabase (portfolio_settings + resume data + projects + testimonials)
    - `generateMetadata()` for SEO (title, description, OG images)
    - SSR page component that calls `getPortfolioData` and renders `<PortfolioPage>`
    - Handle not found (404) and privacy checks
  - Join data from: `portfolio_settings` (bio, avatar, theme, socials), `resumes` (name, summary, experience, education, skills), `portfolio_projects`, `portfolio_testimonials`
- **Create `src/app/p/[slug]/og/route.tsx`**:
  - Dynamic OG image generation following `src/app/r/[slug]/og/route.tsx` pattern
  - Include: name, title/headline, avatar, "Portfolio" label, Kavora branding
- **Create `src/components/PortfolioPage.tsx`**:
  - Full-page portfolio component with these sections:
  - **Hero Section**: Full-width header with name, title (from resume or bio), avatar, social links, view count (reuse ViewCounter pattern). Background uses the selected theme color.
  - **About Section**: Bio text (from portfolio_settings.bio, fallback to resume.summary). Clean typography, generous whitespace.
  - **Skills Section**: Skill tags from resume.skills[]. Styled as pill badges matching theme color.
  - **Experience Section**: Timeline-style list from resume.experience[]. Each entry: title, company, dates, bullet points. Clean, readable layout.
  - **Education Section**: From resume.education[]. Degree, school, location.
  - **Projects Section**: Grid of project cards (2 columns on desktop, 1 on mobile). Each card: image (with aspect-ratio 16/9), title, category badge, description truncated, live link button. Category filter dropdown (if >1 category exists). Empty state if no projects.
  - **Testimonials Section**: Carousel or grid of testimonial cards. Avatar, name, role/company, quote text. Only rendered if `show_testimonials` is true AND user is Pro.
  - **Contact Form Section**: Simple form (name, email, message, submit). Only rendered if `show_contact_form` is true AND user is Pro. Posts to `/api/portfolio/contact`.
  - **Footer**: "Made with Kavora" badge for free users (hidden for Pro). Link to kavora website.
  - **Design Details**:
    - vCard-inspired layout: On desktop, left sidebar (250px) with avatar, name, contact info, social links; main content area with sections
    - On mobile: sidebar becomes a top header that collapses, main content is full-width
    - Use existing Kavora design language: warm neutrals (#faf8f5), the selected palette for accents, Cormorant Garamond for headings, DM Sans for body
    - Sections animate in on scroll (use IntersectionObserver, no Framer Motion dependency needed — CSS animations are sufficient)
    - Each section has a subtle fade-up-in animation when entering viewport
    - Dark background header/sidebar matching palette.headerBg, light content area
    - Smooth scroll navigation if sections are long enough
  - **Responsive breakpoints**: Follow existing Tailwind patterns (md: 768px, lg: 1024px)
  - **Kavora branding badge**: Fixed bottom-right for free users, tasteful semi-transparent badge: "Made with Kavora" with link to homepage. Hidden for Pro users.

### 6. Build Portfolio Editor

- **Task ID**: build-portfolio-editor
- **Depends On**: define-types, build-portfolio-apis
- **Assigned To**: portfolio-editor-builder
- **Agent Type**: react-specialist
- **Parallel**: true (can run alongside task 5 if types and APIs are ready)
- **Create `src/app/create/portfolio/page.tsx`**:
  - Protected page — check authentication on mount (redirect to /login if not authenticated)
  - Fetch portfolio settings, projects, testimonials on mount
  - If no portfolio exists yet, show "Create Your Portfolio" wizard (select slug, enter bio, upload avatar)
  - Split-pane layout matching the resume editor (`src/app/create/page.tsx`):
    - Left: Editor panel with tabs
    - Right: Live preview panel
  - Same header pattern as create/page.tsx (Kavora logo, save status, actions)
- **Create `src/components/PortfolioEditor.tsx`**:
  - Tabbed interface with 4 tabs:
    1. **Projects Tab**: List of project cards (drag-reorder later, simple for now). "Add Project" button. Each project shows thumbnail, title, category. Click to expand/edit. Pro badge on "Add Project" if free user has 3 projects.
    2. **Settings Tab**: Bio textarea, avatar upload (use react-dropzone, already in package.json), social links inputs (LinkedIn, GitHub, Twitter, Website), theme color selector (reuse palette selector pattern from ResumeForm), toggle switches for show_contact_form and show_testimonials (with Pro badge if not Pro).
    3. **Testimonials Tab**: Pro-gated. List of testimonials with add/edit/delete. Each shows name, role, company, text preview.
    4. **Analytics Tab**: View count (total, last 7 days, last 30 days). Simple stats display. Fetch from `/api/portfolio/views?slug=xxx`.
  - Auto-save pattern matching the resume editor (debounced save to API on change)
  - "Save & Share" button that saves all data and shows the portfolio URL modal (same UX as resume editor)
- **Create `src/components/ProjectEditor.tsx`**:
  - Expandable card form for a single project
  - Fields: title (input), description (textarea), category (select dropdown using PROJECT_CATEGORIES), live_url (input with URL validation), image upload (react-dropzone, 5MB limit, jpg/png/webp only)
  - Image preview after upload
  - Save/Delete buttons
  - Upload flow: user drops image → upload to `/api/portfolio/upload` → get URL → set in project data → save
- **Create `src/components/TestimonialEditor.tsx`**:
  - Form for adding/editing a testimonial
  - Fields: name, role, company, text (textarea)
  - Save/Delete buttons
  - Pro-gated (wrapped in ProGate check)
- **Create `src/components/PortfolioPreview.tsx`**:
  - Scaled-down live preview of the portfolio page
  - Wraps `<PortfolioPage>` component in a scaled container (similar to how ResumePreview works)
  - Updates in real-time as editor changes are made

### 7. Update Pricing & Pro Gating

- **Task ID**: update-pricing
- **Depends On**: build-portfolio-page, build-portfolio-editor
- **Assigned To**: pricing-updater
- **Agent Type**: fullstack-developer
- **Parallel**: false (needs portfolio feature complete to verify integration)
- **`src/app/api/checkout/route.ts`**:
  - Change `"line_items[0][price_data][unit_amount]": "900"` → `"1900"`
  - Update product name: `"Kavora Pro — Resume Builder + Portfolio"`
  - Update description: `"One-time payment. AI resume builder, portfolio website, no branding, all premium features."`
- **`src/components/ProGate.tsx`**:
  - Change "Upgrade to Pro — $9" → "Upgrade to Pro — $19"
- **`src/app/pricing/page.tsx`**:
  - Update `$9` → `$19` in the Pro plan card
  - Add portfolio features to `proPlanFeatures` array:
    - "Portfolio website generator"
    - "Unlimited portfolio projects"
    - "Testimonials section on portfolio"
    - "Contact form on portfolio"
    - "Portfolio view analytics"
  - Add portfolio to free plan features:
    - "Basic portfolio (3 projects, Kavora branding)"
  - Update FAQ:
    - Add: "What's included in the portfolio?" → "A full personal website with your experience, skills, projects, and more. Free users get 3 projects with Kavora branding. Pro unlocks unlimited projects, testimonials, contact form, and removes branding."
  - Update pricing heading: "One Price. Resume + Portfolio. Forever."
  - Update Pro plan subtitle: "Every feature, all resumes, your portfolio, forever."
- **`src/app/create/page.tsx`**:
  - Add a "Portfolio" navigation link in the header area (next to existing buttons)
  - Small icon + "Portfolio" text linking to `/create/portfolio`
- **Navigation updates** — add portfolio link to:
  - `src/app/my-resumes/page.tsx` — add "My Portfolio" section/link
  - `src/components/UserMenu.tsx` — add portfolio link if applicable
  - `src/app/page.tsx` (landing page) — mention portfolio feature if there's a features section

### 8. Final Validation

- **Task ID**: validate-all
- **Depends On**: fix-ats, build-portfolio-page, build-portfolio-editor, update-pricing
- **Assigned To**: validator
- **Agent Type**: quality-engineer
- **Parallel**: false
- Run `pnpm build` — verify zero TypeScript errors and successful build
- Run `pnpm lint` — verify zero linting errors
- Verify all new files are properly imported and exported
- Verify no circular dependencies introduced
- Check that existing `/r/[slug]` routes still work unchanged
- Verify ATS-safe PDF export function produces single-column HTML with no flex/grid
- Verify ATSChecker shows correct source-order text for each layout type
- Verify layout warning banner appears for Modern/Compact/Executive layouts
- Verify ProGate modal shows "$19" everywhere
- Verify checkout route sends unit_amount "1900"
- Verify pricing page shows updated features and price
- Verify portfolio page structure follows SSR pattern (no "use client" on page.tsx)
- Verify all API routes handle authentication correctly
- Verify Pro gating works: free users limited to 3 projects, no testimonials, no contact form, branding shown
- Verify image upload route validates file type and size
- Operate in validation mode: inspect and report only, do not modify files

## Acceptance Criteria

1. **ATS-Safe PDF**: A new "Download ATS-Safe PDF" button exists alongside the existing PDF download. It always produces a single-column, no-flex, no-grid HTML document regardless of layout selection.
2. **ATS Text Preview**: The ATSChecker modal has a section showing "How ATS Reads Your Resume" with extracted text in source order for the current layout.
3. **Layout Warning**: A yellow warning banner appears in the editor when Modern, Compact, or Executive layouts are selected.
4. **Font Embedding**: The ATS-safe PDF HTML uses embedded fonts (or system fonts only) — no Google Fonts CDN link.
5. **Portfolio Types**: `src/lib/portfolio-types.ts` exists with all interfaces exported.
6. **Database Migration**: SQL migration file exists with all tables, RLS policies, indexes, and storage bucket.
7. **Portfolio Page**: `/p/[slug]` renders a complete portfolio with Hero, About, Skills, Experience, Education, Projects sections. SSR for SEO.
8. **Portfolio OG Image**: `/p/[slug]/og` generates a dynamic OG image.
9. **Portfolio Editor**: `/create/portfolio` has a working editor with Projects, Settings, Testimonials, Analytics tabs.
10. **Image Upload**: Users can upload project images (max 5MB, jpg/png/webp) via drag-and-drop.
11. **Pro Gating**: Free users get max 3 projects + Kavora branding. Pro users get unlimited + no branding + testimonials + contact form.
12. **Pricing Updated**: All references show $19. Checkout sends $19 to Stripe. Pricing page lists portfolio features.
13. **View Analytics**: Portfolio pages record views. Owner can see basic analytics in the editor.
14. **Zero Regressions**: Existing `/r/[slug]` resume pages, PDF download, and all existing features work unchanged.
15. **Build Passes**: `pnpm build` and `pnpm lint` pass with zero errors.

## Validation Commands

Execute these commands to validate the task is complete:

- `cd /Users/lionel/builders/kavora-resume && pnpm build` — Verify the project builds without TypeScript errors
- `cd /Users/lionel/builders/kavora-resume && pnpm lint` — Verify no linting errors
- `grep -r "unit_amount.*1900" src/app/api/checkout/` — Verify checkout price updated to $19
- `grep -r "\\$19" src/app/pricing/page.tsx src/components/ProGate.tsx` — Verify pricing UI updated
- `grep -r "buildATSSafeHTML" src/components/PDFDownload.tsx` — Verify ATS-safe function exists
- `ls src/app/p/\[slug\]/page.tsx src/app/p/\[slug\]/og/route.tsx` — Verify portfolio routes exist
- `ls src/app/api/portfolio/settings/route.ts src/app/api/portfolio/projects/route.ts src/app/api/portfolio/upload/route.ts` — Verify API routes exist
- `ls src/app/create/portfolio/page.tsx` — Verify portfolio editor route exists
- `ls src/lib/portfolio-types.ts` — Verify types file exists
- `grep -r "display: flex\|display: grid\|grid-template\|flexbox" src/components/PDFDownload.tsx` — Check the ATS-safe function has no flex/grid (should only appear in non-ATS layout functions)

## Notes

- **No new npm dependencies required**: react-dropzone (already installed) handles image upload drag-and-drop. CSS animations are sufficient for scroll reveals (no Framer Motion needed). All other functionality uses existing deps (Supabase, Zod, Next.js).
- **Supabase Storage**: The migration SQL can create the bucket, but the storage bucket may also need to be created via the Supabase dashboard or CLI. Include both approaches in the migration file (SQL + CLI comment).
- **Image optimization**: For v1, uploaded images are served directly from Supabase Storage. Future enhancement: add Next.js Image optimization via `next/image` with Supabase loader.
- **Contact form email delivery**: For v1, store contact messages in a simple table or use the existing email approach if available. Full email delivery (via Resend/AWS SES) can be a follow-up.
- **Portfolio slug strategy**: The portfolio slug should match the user's primary resume slug by default. If the user has multiple resumes, let them pick which slug to use for the portfolio.
- **Existing view counter**: The current view counter stores views in the resume's JSONB `data.views` field. The portfolio uses a proper `portfolio_views` table for better analytics. Consider migrating resume views to a proper table in the future.
- **Reference projects**: The extracted projects in `/P/portfolio-master/` and `/P/vcard-personal-portfolio-master/` are design references only. We borrow the vCard section structure and portfolio-master's premium design sensibility, but all code is written fresh as Next.js/React components.
