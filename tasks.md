# Tasks — Portfolio Website with AI Chatbot

> Derived from [PRD.md](file:///c:/Code/AI%20Pro%20Kit/Portfolio%20Website/PRD.md). Each task is atomic and ordered so its dependencies are completed in an earlier phase.

---

## Phase 0 — Project Scaffold & Configuration

> **Depends on:** nothing. Everything else depends on this.

- [x] **0.1** Initialize the Vercel project in the repo root (`vercel.json`, `package.json` with `type: "module"`)
- [x] **0.2** Define the folder structure:
  ```
  /public        — static HTML / CSS / JS / assets
  /api           — serverless functions
  /admin         — admin page HTML / JS
  /lib           — shared server-side helpers (db, auth, seed)
  profile.md     — seed source (already exists)
  ```
- [x] **0.3** Add placeholder env vars to `.env.local` (gitignored) and document required vars in `README.md`:
  - `DATABASE_URL`, `GROQ_API_KEY`, `ADMIN_PASSWORD`, `JWT_SECRET`
- [x] **0.4** Install production dependencies: `pg` (Postgres client), `jsonwebtoken`, `groq-sdk`
- [x] **0.5** Install dev dependencies (if any): none expected for plain stack
- [x] **0.6** Create `vercel.json` with route rewrites:
  - `/api/*` → serverless functions
  - `/admin` → `/admin/index.html`
  - `/*` → `/public/index.html`
- [x] **0.7** Add `robots.txt` to `/public` — disallow `/admin`
- [x] **0.8** Create `.gitignore` (node_modules, .env*, .vercel)

---

## Phase 1 — Database Schema & Seeding

> **Depends on:** Phase 0 (project scaffold, `pg` dependency, env vars)

### 1A — Schema

- [x] **1.1** Create `/lib/db.js` — export a shared Postgres pool/client using `DATABASE_URL`
- [x] **1.2** Create `/lib/schema.sql` — DDL for all tables:
  - `profile` (id, name, title, location, email, linkedin_url, github_url, bio, photo_url, resume_url, updated_at)
  - `experience` (id, company, role, start_date, end_date, bullets JSONB, sort_order)
  - `projects` (id, title, description, tech JSONB, thumbnail_url, video_url, project_url, sort_order)
  - `skills` (id, category TEXT CHECK, name, sort_order)
  - `faq` (id, question, answer, sort_order)
  - `admin_meta` (key PK, value)
- [x] **1.3** Create `/lib/migrate.js` — reads `schema.sql`, runs `CREATE TABLE IF NOT EXISTS` statements via the pool; callable from any serverless function

### 1B — Seed Parser

- [x] **1.4** Create `/lib/parse-profile.js` — parse `profile.md` into structured JS objects:
  - Extract name, title, location, email, linkedin_url, github_url, bio
  - Extract experience entries (company, role, dates, bullet list)
  - Extract projects (title, description, tech tags, links)
  - Extract skills grouped by category
  - Extract FAQ pairs
- [x] **1.5** Write unit-style manual test: run parser against `profile.md`, log output, verify correctness

### 1C — Seed Runner

- [x] **1.6** Create `/lib/seed.js`:
  - Check if `profile` table has any rows
  - If empty → run parsed data through INSERT statements inside a single transaction
  - Write `seeded_at` to `admin_meta`
  - Idempotent: safe to call on every cold start
- [x] **1.7** Create `/api/seed.js` — internal-only endpoint (or just export a callable) that runs migrate → seed in sequence
- [ ] **1.8** Test seed against a real Vercel Postgres instance: verify tables created and data inserted correctly

---

## Phase 2 — Public Content API

> **Depends on:** Phase 1 (database, seed, `db.js`)

- [x] **2.1** Create `/api/content.js` — `GET` handler:
  - Trigger migrate + seed check (lightweight, idempotent)
  - Query all tables: profile, experience (ORDER BY sort_order), projects (ORDER BY sort_order), skills (ORDER BY category, sort_order), faq (ORDER BY sort_order)
  - Return combined JSON response `{ profile, experience, projects, skills, faq }`
- [x] **2.2** Add CORS headers to response (allow same-origin, Vercel auto-handles)
- [x] **2.3** Add basic error handling: return 500 with generic message on DB failure
- [ ] **2.4** Test `/api/content` end-to-end: deploy to Vercel preview, confirm JSON shape and data

---

## Phase 3 — Public Frontend (Layout & Sections)

> **Depends on:** Phase 0 (scaffold), Phase 2 (content API provides data)

### 3A — Design System & Shell

- [x] **3.1** Choose and import Google Fonts (display + body) in `/public/index.html` `<head>`
- [x] **3.2** Create `/public/css/variables.css` — CSS custom properties for light & dark themes:
  - `--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--accent-hover`, `--border`, `--shadow`
  - Dark theme via `[data-theme="dark"]` selector
- [x] **3.3** Create `/public/css/reset.css` — minimal CSS reset / normalize
- [x] **3.4** Create `/public/css/base.css` — global typography, body, links, buttons, utility classes
- [x] **3.5** Create `/public/css/layout.css` — section containers, responsive grid/flex utilities, max-width wrapper
- [x] **3.6** Create `/public/css/animations.css` — keyframes for fade-in-up, slide-in, card-hover-lift, modal transitions

### 3B — HTML Structure

- [x] **3.7** Create `/public/index.html`:
  - SEO: `<title>`, `<meta description>`, Open Graph tags (`og:title`, `og:description`, `og:image`)
  - `<meta name="robots" content="index, follow">`
  - Link all CSS files
  - Semantic sections: `<header>`, `<main>`, `<footer>`
  - Empty placeholder elements with IDs for JS hydration:
    - `#hero`, `#about`, `#experience`, `#projects`, `#skills`, `#contact`, `#footer`
  - `<div id="project-modal">` — hidden modal shell
  - `<div id="chatbot-widget">` — chat launcher + panel shell
  - Script tags at end of body

### 3C — Theme Toggle

- [x] **3.8** Create `/public/js/theme.js`:
  - On load: read `localStorage.getItem('theme')` → fallback to `prefers-color-scheme` → set `data-theme` on `<html>` **before first paint** (inline script in `<head>`)
  - Toggle button flips `data-theme` and persists to `localStorage`
  - Animate toggle icon (sun ↔ moon)

### 3D — Section Renderers

- [x] **3.9** Create `/public/js/api.js` — fetch `/api/content`, cache result in a module-level variable, export `getContent()` promise
- [x] **3.10** Create `/public/js/hero.js` — render hero section:
  - Profile photo (placeholder avatar if URL missing)
  - Name, title, short bio line
  - `View Resume` button (links to resume URL or shows tooltip "Coming soon" if missing)
  - Primary CTA → smooth-scroll to `#contact`
  - Theme toggle button
- [x] **3.11** Create `/public/js/about.js` — render bio text into `#about`
- [x] **3.12** Create `/public/js/experience.js` — render experience timeline/cards into `#experience`:
  - Each entry: company, role, date range, bullet list
  - Ordered by sort_order
  - Scroll-triggered fade-in animation
- [x] **3.13** Create `/public/js/projects.js` — render project card grid into `#projects`:
  - Each card: thumbnail (placeholder if missing), title, short description, tech tag chips
  - Click handler → open project modal
- [x] **3.14** Create `/public/js/modal.js` — project detail modal:
  - Full description, full tech stack, project link, video link (if present)
  - All links clickable, open in new tab
  - Close on overlay click, Escape key, close button
  - Focus trap for accessibility
  - Fade-in / fade-out animation
- [x] **3.15** Create `/public/js/skills.js` — render skill chips grouped by category into `#skills`:
  - Three groups: Technical, Tools & Platforms, Soft Skills
  - Styled chips/tags with category headings
- [x] **3.16** Create `/public/js/contact.js` — render contact section into `#contact`:
  - Email as `mailto:` link/button
  - LinkedIn as external link/button
  - GitHub as external link/button
- [x] **3.17** Create `/public/js/footer.js` — render footer: name, © year (dynamic), quick nav links
- [x] **3.18** Create `/public/js/scroll-animations.js` — `IntersectionObserver` to trigger fade-in-up on sections as they enter viewport

### 3E — Section-Specific Styles

- [x] **3.19** Create `/public/css/hero.css` — hero layout, photo styling, CTA button
- [x] **3.20** Create `/public/css/about.css` — about section typography
- [x] **3.21** Create `/public/css/experience.css` — timeline / card layout
- [x] **3.22** Create `/public/css/projects.css` — card grid, thumbnail, tag chips
- [x] **3.23** Create `/public/css/modal.css` — modal overlay, panel, transitions
- [x] **3.24** Create `/public/css/skills.css` — chip/tag styling, category groups
- [x] **3.25** Create `/public/css/contact.css` — contact buttons/links layout
- [x] **3.26** Create `/public/css/footer.css` — footer layout and links

### 3F — Main Entry & Orchestrator

- [x] **3.27** Create `/public/js/main.js`:
  - Import all section renderers
  - On `DOMContentLoaded`: fetch content → call each renderer → init scroll animations → init theme
  - Handle fetch errors: show a friendly fallback message

### 3G — Responsive & Cross-Browser

- [ ] **3.28** Add media queries to all CSS files for mobile breakpoints (≤768px, ≤480px)
- [ ] **3.29** Test and fix layout on mobile viewport (hamburger nav if needed, stacked cards, full-width sections)
- [ ] **3.30** Verify smooth-scroll behavior, modal behavior, and theme toggle on mobile

---

## Phase 4 — Chatbot (Backend + Widget)

> **Depends on:** Phase 1 (database), Phase 2 (content API pattern), Phase 3A/3B (widget container in HTML & base CSS)

### 4A — Chat API

- [x] **4.1** Create `/lib/build-context.js`:
  - Query all tables (profile, experience, projects, skills, faq)
  - Concatenate into a structured plain-text context string for the LLM
- [x] **4.2** Create `/lib/system-prompt.js`:
  - Export the system prompt string enforcing all tone rules (§8.2), grounding rules (§8.1), and hard prohibitions (§8.4)
  - Inject the context string as a `<context>` block
  - Instruct Markdown link formatting for all URLs and emails
- [x] **4.3** Create `/api/chat.js` — `POST` handler:
  - Parse request body: `{ message, history[] }`
  - Run migrate + seed check
  - Build context from DB via `build-context.js`
  - Assemble messages: system prompt + history + user message
  - Call Groq API (Llama 3.1/3.3) with streaming enabled
  - Stream response back via chunked transfer / SSE
  - On Groq error → return 503 with friendly fallback message including contact email
- [x] **4.4** Add basic per-IP rate limiting to `/api/chat.js`:
  - In-memory Map (resets on cold start, acceptable for v1)
  - Limit: e.g., 20 requests per minute per IP
  - Return 429 with friendly message on exceed
- [x] **4.5** Test chat API: send sample questions, verify grounded answers, verify streaming, verify rate limit

### 4B — Chat Widget Frontend

- [x] **4.6** Create `/public/css/chatbot.css`:
  - Floating launcher button (bottom-right, circular, accent color, subtle pulse animation)
  - Chat panel (slide-up or expand, max-width/height, dark/light theme aware)
  - Message bubbles (user vs bot, different alignment/color)
  - Input area (text input + send button + mic button)
  - Suggested-question chips
  - Typing indicator animation
  - Full-screen sheet on mobile (≤768px)
- [x] **4.7** Create `/public/js/chatbot.js`:
  - Launcher click → toggle chat panel visibility (slide animation)
  - On first open: fetch FAQ from content API → render 4–6 suggested question chips
  - Chip click → populate input and auto-send
  - Send button / Enter key → POST to `/api/chat`, append user bubble, show typing indicator
  - Stream response: read chunks, append tokens to bot bubble in real time (typing effect)
  - Post-process bot message: convert Markdown links `[text](url)` to `<a>` tags (`target="_blank"`, `mailto:` for emails)
  - Error handling: show fallback message with clickable contact email on API failure
  - Scroll to bottom on new message
- [x] **4.8** Create `/public/js/speech.js`:
  - Check `window.SpeechRecognition` / `webkitSpeechRecognition` support
  - Mic button: start recognition → on result, fill input field (editable before send)
  - Visual indicator while listening (pulsing mic icon)
  - Graceful fallback: hide mic button if API unsupported
- [x] **4.9** Integrate chatbot into `main.js` — initialize on page load
- [ ] **4.10** Test chatbot end-to-end: open widget, click suggested question, type question, verify streaming, verify link rendering, verify voice input, verify mobile full-screen

---

## Phase 5 — Admin Authentication & CRUD API

> **Depends on:** Phase 1 (database, `db.js`), Phase 0 (`jsonwebtoken` dep)

### 5A — Auth

- [x] **5.1** Create `/lib/auth.js`:
  - `verifyPassword(password)` — compare against `process.env.ADMIN_PASSWORD`
  - `signToken()` — sign JWT with `process.env.JWT_SECRET`, short expiry (e.g., 4 hours)
  - `verifyToken(token)` — verify + decode JWT, throw on invalid/expired
  - `extractToken(req)` — read token from HTTP-only cookie
- [x] **5.2** Create `/api/admin/login.js` — `POST` handler:
  - Parse body: `{ password }`
  - Verify against env var
  - On success: sign JWT, set HTTP-only secure cookie, return 200
  - On failure: return 401
- [x] **5.3** Test login: correct password → cookie set; wrong password → 401

### 5B — CRUD Endpoints

- [x] **5.4** Create auth middleware helper in `/lib/auth.js`:
  - `requireAuth(req)` — extract token from cookie, verify, throw 401 if invalid
- [x] **5.5** Create `/api/admin/profile.js`:
  - `GET` — return current profile row (authed)
  - `PUT` — update profile fields (authed), set `updated_at`
- [x] **5.6** Create `/api/admin/experience.js`:
  - `GET` — list all experience entries ordered by sort_order (authed)
  - `POST` — create new experience entry (authed)
  - `PUT` — update experience entry by id (authed)
  - `DELETE` — delete experience entry by id (authed)
  - `PATCH` — reorder (update sort_order values) (authed)
- [x] **5.7** Create `/api/admin/projects.js`:
  - `GET` / `POST` / `PUT` / `DELETE` / `PATCH` (reorder) — same pattern as experience (authed)
- [x] **5.8** Create `/api/admin/skills.js`:
  - `GET` / `POST` / `PUT` / `DELETE` / `PATCH` (reorder) — same pattern, grouped by category (authed)
- [x] **5.9** Create `/api/admin/faq.js`:
  - `GET` / `POST` / `PUT` / `DELETE` / `PATCH` (reorder) — same pattern (authed)
- [x] **5.10** Create `/api/admin/upload.js`:
  - `POST` — accept file upload (resume PDF or profile photo)
  - Store via Vercel Blob (or `/public/assets/` for v1)
  - Save resulting URL to `profile.photo_url` / `profile.resume_url` / `admin_meta`
- [x] **5.11** Test all CRUD endpoints: create, read, update, delete, reorder for each table; verify public `/api/content` reflects changes immediately

---

## Phase 6 — Admin Frontend

> **Depends on:** Phase 5 (admin API endpoints), Phase 3A (design system CSS)

- [x] **6.1** Create `/admin/index.html`:
  - `<meta name="robots" content="noindex, nofollow">`
  - Login form (password input + submit)
  - Main admin panel (hidden until authenticated)
  - Link shared CSS vars + admin-specific CSS
- [x] **6.2** Create `/admin/css/admin.css`:
  - Login form styling
  - Form sections, input fields, textareas, buttons
  - Table/list style for entries (experience, projects, skills, faq)
  - Drag handle / reorder controls
  - Success/error toast notifications
- [x] **6.3** Create `/admin/js/admin-auth.js`:
  - Login form submit → POST `/api/admin/login`
  - On success: hide login form, show admin panel, load data
  - On failure: show error message
  - On page load: attempt a test request to check if cookie is still valid → auto-show panel if authed
- [x] **6.4** Create `/admin/js/admin-profile.js`:
  - Fetch current profile → populate form fields
  - Save button → PUT `/api/admin/profile`
  - Photo upload → POST `/api/admin/upload`
  - Resume upload → POST `/api/admin/upload`
  - Show success/error feedback
- [x] **6.5** Create `/admin/js/admin-experience.js`:
  - List existing entries in editable table/list
  - Add new entry form
  - Edit inline or in modal
  - Delete with confirmation
  - Reorder (drag-and-drop or up/down buttons) → PATCH sort_order
  - Save → appropriate API calls
- [x] **6.6** Create `/admin/js/admin-projects.js`:
  - Same add/edit/delete/reorder pattern as experience
  - Additional fields: thumbnail URL, video URL, project URL
- [x] **6.7** Create `/admin/js/admin-skills.js`:
  - Same pattern, with category selector (Technical / Tools & Platforms / Soft Skills)
  - Group display by category
- [x] **6.8** Create `/admin/js/admin-faq.js`:
  - Same add/edit/delete/reorder pattern
  - Question + answer fields
- [x] **6.9** Create `/admin/js/admin-main.js`:
  - Orchestrate: init auth check → load all section editors
  - Tab or accordion navigation between sections
- [ ] **6.10** Test admin panel end-to-end: login → edit each section → verify changes on public site → verify chatbot reflects new data

---

## Phase 7 — Polish, Security Hardening & Deployment

> **Depends on:** all previous phases functional

### 7A — Security Audit

- [x] **7.1** Verify `GROQ_API_KEY` never appears in any client-served file (search all `/public`, `/admin` files)
- [x] **7.2** Verify `JWT_SECRET` and `ADMIN_PASSWORD` never appear in client code
- [x] **7.3** Verify all `/api/admin/*` routes reject requests without valid JWT (test with expired / missing / tampered tokens)
- [x] **7.4** Verify chat API rate limiting works (send >20 rapid requests from same IP)
- [x] **7.5** Verify `robots.txt` disallows `/admin`
- [x] **7.6** Verify admin page has `noindex, nofollow` meta tag

### 7B — Accessibility

- [x] **7.7** Add `alt` text to all images (profile photo, project thumbnails)
- [x] **7.8** Ensure all interactive elements (buttons, links, modal, chat) are keyboard-navigable (`tabindex`, `aria-*` attributes)
- [x] **7.9** Add `aria-label` to chatbot launcher, theme toggle, close buttons
- [x] **7.10** Verify color contrast ratios meet WCAG AA in both themes
- [x] **7.11** Ensure modal and chat panel have focus trapping

### 7C — Performance

- [x] **7.12** Audit page load: target first contentful paint < 2s
- [x] **7.13** Inline the theme-detection script in `<head>` to prevent flash of wrong theme
- [x] **7.14** Lazy-load project thumbnails (native `loading="lazy"`)
- [x] **7.15** Minify CSS/JS for production (or rely on Vercel's built-in optimizations)

### 7D — SEO & Social

- [x] **7.16** Verify `<title>` tag is descriptive and unique
- [x] **7.17** Verify `<meta name="description">` is compelling and accurate
- [x] **7.18** Verify Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`) render correct LinkedIn preview card
- [x] **7.19** Add `<link rel="canonical">` with production URL

### 7E — Final Testing & Deploy

- [ ] **7.20** Full walkthrough on desktop (Chrome, Firefox, Edge): all sections render, theme toggle works, modal works, chatbot works, resume link works
- [ ] **7.21** Full walkthrough on mobile (or DevTools mobile emulation): responsive layout, chatbot full-screen sheet, touch interactions
- [ ] **7.22** Deploy to Vercel production:
  - Set all env vars (`GROQ_API_KEY`, `ADMIN_PASSWORD`, `JWT_SECRET`)
  - Connect Vercel Postgres
  - Trigger first deploy → verify self-seed populates DB
- [ ] **7.23** Verify production URL loads correctly with real data
- [ ] **7.24** Share link on LinkedIn preview check → verify OG card renders
- [ ] **7.25** Smoke test admin login on production → make one edit → verify it appears on public site and in chatbot answers
