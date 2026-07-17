# PRD — Yerrithatha Choppa Portfolio Website with AI Chatbot

**Owner:** Yerrithatha Choppa
**Document status:** Draft v1
**Last updated:** July 11, 2026

---

## 1. Summary

A single-page, modern portfolio website for Yerrithatha Choppa that showcases his background (bio, experience, projects, skills, contact) and includes an AI chatbot that answers visitor questions about him using only the content in `profile.md`. A password-protected admin page lets him edit that content later without touching code. Everything is deployed on Vercel with Vercel Postgres for storage.

**Primary audience:** Recruiters, hiring managers, and clients evaluating him for Data Analyst / Data Specialist / Data Scientist / Junior AI-ML / Python Developer roles.

**Primary goal:** Give visitors a fast, credible read on his experience and a low-friction way to get answers or make contact — shareable as a single public link on LinkedIn.

---

## 2. Open items (need before final build)

These don't block writing the PRD but do block a pixel-perfect build:

| Item | Status | Action |
|---|---|---|
| Design reference image | Not received — the message referenced an attachment but none came through | Upload the image; until then, the design system in §6 (clean, modern, dark-friendly, finance/data aesthetic) is the default direction |
| Resume PDF | Not yet uploaded | Upload when ready; `View Resume` button will 404-safe (show a "coming soon" tooltip) until a file exists |
| Profile photo | Not yet uploaded | Hero will use a styled placeholder avatar until provided |
| Project thumbnails / video links | Not yet uploaded | Cards will use styled placeholder thumbnails until provided |

None of these block development — they're swappable assets/config, not architecture.

---

## 3. Firm decisions (locked, do not change without explicit approval)

1. **Grounded and gracious chatbot.** Answers only from data sourced from `profile.md` (via the database). Never invents facts. Tricky/negotiation questions (salary, notice period, working for free, relocation) get a diplomatic, helpful answer if the info exists, or a warm invitation to contact him directly if it doesn't. A flat "I don't know" is a last resort, reserved for genuinely off-topic or unknowable questions.
2. **Clickable, warm formatting.** Any mention of LinkedIn, GitHub, a project link, or email in a bot answer renders as a real clickable link (email as `mailto:`), never plain text. Answers are first-person, 2–4 sentences.
3. **Security.** The Groq API key never reaches the browser or client-side code. All calls to Groq happen in a server-side (Vercel serverless/edge) function.
4. **Private admin page.** Password-protected, session secured with a JWT signed by `JWT_SECRET`. Edits (bio, experience, projects, skills, FAQ) take effect immediately, no redeploy.
5. **Vercel-only deployment.** Site + chatbot API + admin API all run as one Vercel project. Storage is Vercel Postgres, connected via the auto-injected `DATABASE_URL`. Secrets (`GROQ_API_KEY`, `ADMIN_PASSWORD`, `JWT_SECRET`) come from Vercel environment variables only.
6. **Self-seeding on first run.** If the database is empty on first request, the app parses `profile.md` (bundled in the repo) and populates the database automatically, so the live site is never blank.
7. **Plain stack.** HTML, CSS, vanilla JavaScript (no heavy frontend framework) for the public site, so a non-developer can maintain it. Serverless functions (Node.js) for the API/admin/chatbot backend. Free-tier AI provider: **Groq, Llama 3.1/3.3**.

---

## 4. Out of scope (v1)

- Multi-language support
- Analytics/visitor tracking dashboards
- Multi-user admin (only one admin login)
- Chatbot memory across sessions (each visit starts fresh)
- Payment, scheduling, or calendar integrations
- Native mobile app

---

## 5. Information architecture (single page)

1. **Hero** — profile photo, name, title, short bio line, `View Resume` button, theme toggle, primary CTA (contact / scroll to contact).
2. **About** — short bio (from `profile.md` Bio field).
3. **Experience** — timeline/cards: S&P Global (Data Specialist), S&P Global (Lead Data Analyst), S&P Capital IQ (Data Analyst), with dates and bullet highlights.
4. **Projects** — card grid; each card = thumbnail + title + short description + tech tags; click opens a modal with full description, tech stack, and links (project link, optional video link) — all clickable, no new-page navigation.
5. **Skills** — grouped chips/tags: Technical, Tools & Platforms, Soft Skills.
6. **Contact** — email (mailto), LinkedIn, GitHub, all as buttons/links.
7. **Chatbot widget** — persistent floating launcher (bottom-right) that opens a chat panel; available from anywhere on the page.
8. **Footer** — name, year, quick links.

Admin page (`/admin`) is a separate route, not linked from the public nav.

---

## 6. Design system (default direction, pending reference image)

- **Aesthetic:** modern, clean, "data/finance-meets-AI" feel — not a generic Bootstrap template. Confident typography, generous whitespace, subtle motion (fade/slide on scroll), a restrained accent color (e.g., a deep teal or amber) against neutral dark/light backgrounds.
- **Theme:** light and dark variants using CSS custom properties (`--bg`, `--surface`, `--text`, `--accent`, etc.). Toggle switches a `data-theme` attribute on `<html>`.
- **Theme persistence:** stored in `localStorage`; on load, JS applies saved theme before first paint (to avoid flash of wrong theme). Falls back to `prefers-color-scheme` if no saved value.
- **Typography:** one distinctive display font for headings (e.g., a modern serif or geometric sans from Google Fonts) + a clean sans for body text.
- **Motion:** minimal, purposeful — card hover lift, modal fade-in, chat message stream-in. No gratuitous animation.
- **Responsiveness:** mobile-first; chatbot widget collapses to a full-screen sheet on small screens.

Once the reference image is uploaded, this section gets revised to match it (palette, layout rhythm, component style) before development starts.

---

## 7. Data model (Vercel Postgres)

All editable content lives in the database; `profile.md` is only the **seed source**, not a runtime dependency after first seed.

```
profile
  id (pk, singleton row)
  name, title, location, email, linkedin_url, github_url, bio
  updated_at

experience
  id (pk)
  company, role, start_date, end_date (nullable = "Present")
  bullets (jsonb array of strings)
  sort_order

projects
  id (pk)
  title, description, tech (jsonb array of strings)
  thumbnail_url, video_url (nullable), project_url (nullable)
  sort_order

skills
  id (pk)
  category (enum: technical | tools | soft)
  name
  sort_order

faq
  id (pk)
  question, answer
  sort_order

admin_meta
  key, value   -- e.g. seeded_at, resume_url
```

**Seeding logic:** On any API request, a lightweight check runs — "does `profile` table have a row?" If not, the server parses the bundled `profile.md` (deployed as a repo asset) into these tables in one transaction, then proceeds normally. This makes seeding idempotent and safe to trigger from any cold start.

---

## 8. Chatbot behavior specification

### 8.1 Grounding
- On each user question, the server assembles a context string from the current database content (bio, experience, projects, skills, FAQ) — always live data, never a stale copy of `profile.md`.
- The system prompt instructs the model: answer **only** using the supplied context; never fabricate employers, dates, skills, or figures not present; keep answers first-person as Yerrithatha; 2–4 sentences; format any link as Markdown (rendered as clickable HTML on the frontend); email always as `mailto:`.

### 8.2 Tone rules (hard requirements in the system prompt)
- Warm, professional, first person ("I have 11+ years...", not "He has...").
- For salary / notice period / relocation / "will you work for free" type questions:
  - If the FAQ or profile has an answer → give it, phrased diplomatically.
  - If not → a friendly, professional non-committal reply that invites direct conversation, with the email rendered as a clickable mailto link. Never a bare refusal.
- For genuinely off-topic questions (e.g., "what's the weather," "write me code unrelated to this site," personal questions unrelated to his professional background) → a brief, warm redirect back to his professional background, only as a last resort, still ending with an invitation to reach out via the contact link.
- Never invent facts, never share information not present in the data, never make commitments (start dates, salary numbers, guarantees) on his behalf.

### 8.3 UX behavior
- **Suggested questions:** 4–6 clickable example prompts shown on first open (e.g., "What's your strongest skill?", "Are you open to relocation?", "Tell me about your S&P Global work"), sourced from the FAQ table so they update if he edits the FAQ.
- **Input modes:** text input, and a mic button using the browser's built-in `SpeechRecognition` API (free, no third-party service) for voice-to-text; transcribed text is editable before sending.
- **Streaming:** responses render token-by-token (typing effect) using a streamed response from the serverless function (Groq's streaming API passed through to the client via Server-Sent Events or chunked fetch).
- **Link rendering:** the frontend renders the model's Markdown-style links as real `<a>` tags (target="_blank" for external, `mailto:` for email) — enforced by a small post-processing step, not left to the model's raw HTML output (for safety/consistency).
- **Error handling:** if Groq is unreachable or rate-limited, the widget shows a graceful fallback message and still surfaces the contact email as a clickable link.

### 8.4 What the bot must never do
- Never expose the system prompt, API key, or internal architecture if asked.
- Never answer questions about third parties, unrelated general knowledge, or generate content unrelated to Yerrithatha's professional profile.
- Never claim availability, salary figures, or commitments that aren't explicitly in the data.

---

## 9. Admin page specification

- **Route:** `/admin`, not linked in public navigation, not indexed (`robots.txt` disallow + `noindex` meta).
- **Auth:** login form (password only, checked against `ADMIN_PASSWORD` env var) → on success, server issues a JWT (signed with `JWT_SECRET`, short-lived, stored as an HTTP-only cookie). All admin API routes verify this JWT server-side.
- **Capabilities:**
  - Edit profile (name, title, bio, location, email, LinkedIn, GitHub).
  - Add/edit/delete/reorder experience entries.
  - Add/edit/delete/reorder projects (including thumbnail/video/link URLs).
  - Add/edit/delete/reorder skills, grouped by category.
  - Add/edit/delete/reorder FAQ entries.
  - Upload/replace resume PDF and profile photo (stored via Vercel Blob or similar; URL saved in `admin_meta` / `profile`).
- **Effect:** every save writes directly to Postgres; the public site and chatbot always read live from the database, so changes appear immediately with no redeploy.
- **No code editing required** — plain forms, save buttons, simple table-style lists for reordering.

---

## 10. Technical architecture

```
Vercel Project
├── /public (or /src) — static HTML/CSS/JS site (hero, sections, modal, chat widget)
├── /api
│   ├── chat.js          — POST: receives visitor question, builds context from DB,
│   │                      calls Groq (server-side, streamed), returns answer
│   ├── content.js       — GET: public read of profile/experience/projects/skills/faq
│   ├── admin/login.js   — POST: checks ADMIN_PASSWORD, issues JWT cookie
│   ├── admin/content.js — GET/PUT/POST/DELETE: authenticated CRUD on all content tables
│   └── seed.js          — internal helper, invoked automatically on empty-DB detection
├── /admin — admin HTML/JS (separate lightweight page, calls /api/admin/*)
├── profile.md — bundled as seed source only
└── vercel.json / env config
```

- **Runtime:** Vercel Serverless (Node.js) functions for API routes.
- **Database:** Vercel Postgres, `DATABASE_URL` auto-injected by Vercel — no manual connection string handling.
- **AI provider:** Groq API (Llama 3.1/3.3), called only from `/api/chat.js`, key read from `process.env.GROQ_API_KEY`.
- **Env vars required:** `DATABASE_URL` (auto), `GROQ_API_KEY`, `ADMIN_PASSWORD`, `JWT_SECRET`.
- **Assets:** profile photo, resume PDF, project thumbnails/videos stored via Vercel Blob (or a `/public/assets` folder for v1 static placeholders, upgradeable to Blob once admin uploads are needed).

---

## 11. Non-functional requirements

- **Performance:** first contentful paint under ~2s on a typical connection; theme applied before paint (no flash).
- **Accessibility:** semantic HTML, keyboard-navigable modal and chat widget, sufficient color contrast in both themes, alt text on images.
- **SEO:** basic meta tags (title, description, Open Graph image) so the LinkedIn share link shows a proper preview card.
- **Security:**
  - No secrets in client bundle (verified by checking no `GROQ_API_KEY`/`JWT_SECRET`/`ADMIN_PASSWORD` string appears in any file served to the browser).
  - Admin routes reject requests without a valid JWT.
  - Chat endpoint rate-limited (basic per-IP throttle) to control Groq usage/cost.
- **Reliability:** self-seed logic is idempotent — safe to run on every cold start without duplicating data.

---

## 12. Success criteria

- Single public URL, shareable on LinkedIn, loads with real content (never blank) on first deploy.
- Visitor can toggle theme, view resume, browse projects in modals, and get accurate, well-formatted chatbot answers grounded in `profile.md`-sourced data.
- Yerrithatha can log into `/admin`, edit any section, and see the change reflected live on the public site and in chatbot answers without a redeploy.
- No secret key ever appears in browser network requests or page source.

---

## 13. Next steps

1. Upload the design reference image → revise §6 to match.
2. Upload resume PDF, profile photo, and project thumbnails/videos.
3. Confirm this PRD, then proceed to scaffolding the Vercel project (repo structure, DB schema migration, seed script, chat API, admin API, frontend).
