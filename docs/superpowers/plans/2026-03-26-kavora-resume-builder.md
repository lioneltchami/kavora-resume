# Kavora Resume Builder — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Build a resume builder web app where users fill in a form, see a live preview, save their resume with a unique URL slug, and share/download it.

**Architecture:** Next.js App Router with split-pane editor (form left, live preview right). Supabase for persistence — each resume gets a slug URL. Public view page renders the beautiful web resume template. PDF download via client-side generation.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Supabase, TypeScript, html2canvas + jsPDF

---

## File Structure

```
src/
  app/
    layout.tsx          — Root layout (fonts, metadata, globals)
    page.tsx            — Landing page (hero, features, CTA)
    globals.css         — Tailwind + custom styles
    create/
      page.tsx          — Resume editor (split-pane: form + preview)
    r/
      [slug]/
        page.tsx        — Public resume view (SSR from Supabase)
    api/
      resume/
        route.ts        — POST (save) and GET (fetch) resume API
  components/
    ResumeForm.tsx      — Form component with all sections
    ResumePreview.tsx   — Live preview component (scaled A4 render)
    ResumeWeb.tsx       — Public web resume view (beautiful template)
    PDFDownload.tsx     — PDF generation button
  lib/
    supabase.ts         — Supabase client config
    types.ts            — Resume data types
    slugify.ts          — Slug generation helper
```

---

### Task 1: Core Config & Types

Files: `src/lib/types.ts`, `src/lib/supabase.ts`, `src/lib/slugify.ts`, `src/app/layout.tsx`

### Task 2: Landing Page

Files: `src/app/page.tsx`, `src/app/globals.css`

### Task 3: Resume Form Component

Files: `src/components/ResumeForm.tsx`

### Task 4: Resume Preview Component

Files: `src/components/ResumePreview.tsx`

### Task 5: Editor Page (Split-Pane)

Files: `src/app/create/page.tsx`

### Task 6: API Route

Files: `src/app/api/resume/route.ts`

### Task 7: Public Resume View

Files: `src/components/ResumeWeb.tsx`, `src/app/r/[slug]/page.tsx`

### Task 8: PDF Download

Files: `src/components/PDFDownload.tsx`

### Task 9: Supabase Setup & Deploy

Database setup + Vercel deploy
