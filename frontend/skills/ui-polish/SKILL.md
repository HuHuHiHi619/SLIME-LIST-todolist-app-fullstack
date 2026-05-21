# UI Polish Skill — SlimeList Frontend

Source of truth extracted from `tailwind.config.js`, `src/styles/`, and live components.
Do not invent tokens — only use what is documented here.

---

## 1. Color Tokens

### Desktop palette (flat, `tailwind.config.js > colors`)

| Token | Hex | Usage |
|-------|-----|-------|
| `darkBackground` | `#12112D` | Page background, `.main-content` |
| `purpleMain` | `#1E1E39` | Card fill, dropdowns, datepicker bg |
| `purpleNormal` | `#363669` | Mid-layer borders, hover states, task item bg |
| `purpleBorder` | `#5454FF` | Active borders, primary buttons, selected states |
| `pendingdTheme` | `#FBA05F` | Pending status badge |
| `completedTheme` | `#40EDC3` | Completed status badge |
| `deadlineTheme` | `#E22D38` | Failed/deadline status, destructive actions |
| `startDateTheme` | `#2D80E2` | Start date fields |
| `categoryTheme` | `#FFD595` | Category labels |

### Background-image gradients (used as `bg-*` utilities)

| Token | Direction | Use |
|-------|-----------|-----|
| `purpleGradient` | → right: `#6D6DFD → #CE88FA → #6D6DFD` | Brand gradient, badge border shimmer |
| `progressGradient` | → right: `#3434B2 → #6D6DFD → #CE88FA` | Progress bars |
| `purpleSidebar` | ↑ top: `#12112D → #212140` | Sidebar fill |
| `purpleNavbar` | ← left: `#12112D → #212140` | Navbar fill |
| `purpleActive` | ← left: `#5D5DEA → #212140` | Active nav item |
| `purpleActiveTask` | → right: `#5D5DEA → #212140` | Selected task item |
| `completedTask` | → right: `rgba(48,232,155,0.8) 10% → #363669` | Completed task row |
| `failedTask` | → right: `#C51313 → #5F0909` | Failed task row |
| `streak` | ↓ bottom: `#FFDA93 → #DEA331 → #DE6F31 → #783C1A` | FlameBox tier 1 (orange) |
| `hotterStreak` | ↓ bottom: `#93E8FF → #31B3DE → #3176DE → #1A1F78` | FlameBox tier 2 (blue) |
| `hottestStreak` | ↓ bottom: `#D993FF → #9631DE → #7C31DE → #361A78` | FlameBox tier 3 (purple) |

### Slime mobile tokens (nested, `slime.*`)

These were added in Task 1a for the mobile retrofit. Use for new mobile-first components.

| Token | Hex | Role |
|-------|-----|------|
| `slime-bg` | `#12112D` | = `darkBackground` |
| `slime-bg-2` | `#1A1936` | Raised surface |
| `slime-card` | `#1E1E39` | = `purpleMain` |
| `slime-card-2` | `#22223C` | Slightly lifted card |
| `slime-surface` | `#2A2A4A` | Topmost surface layer |
| `slime-border` | `#36366F` | Default stroke (dim) |
| `slime-border-2` | `#9999E3` | Active / focus stroke |
| `slime-border-3` | `#6D6DFD` | Input focus ring |
| `slime-muted` | `#9999E3` | Body text on dark |
| `slime-muted-2` | `#919191` | Dimmer secondary text |
| `slime-purple` | `#7C5CFF` | Primary accent |
| `slime-purple-2` | `#A66BFF` | Lighter accent |
| `slime-pink` | `#E37DDE` | Highlight |
| `slime-pink-2` | `#B45CFF` | Alternate highlight |
| `slime-blue` | `#6464FF` | Info |
| `slime-blue-2` | `#5555D6` | Info dim |
| `slime-amber` | `#DEA331` | Warning |
| `slime-amber-2` | `#DE6F31` | Warning dark |
| `slime-green` | `#2BB795` | Success |
| `slime-red` | `#E22D38` | = `deadlineTheme` |

### Box shadows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-slime-card` | `0 4px 12px rgba(0,0,0,0.4)` | Standard card depth |
| `shadow-slime-purple` | `0 4px 14px rgba(124,92,255,0.45)` | Purple glow on active elements |
| `shadow-slime-glow` | `0 0 24px rgba(153,153,227,0.2)` | Soft ambient halo |

---

## 2. Border Radius Patterns

| Class | Value | Where used |
|-------|-------|-----------|
| `rounded-lg` | 8 px | Compact buttons (`.register`, `.login`, `.done-button`) |
| `rounded-xl` | 12 px | Search inputs, search result cards, task popups |
| `rounded-2xl` | 16 px | Task list items, red-button variant |
| `rounded-3xl` | 24 px | All major panel cards (TaskList, StreakField boxes, BadgeField, Summary, Sidebar) |
| `rounded-full` | 9999 px | Cancel button, icon pill |
| `border-radius: 999px` (CSS) | — | Custom checkbox |
| `border-radius: 20px` (CSS) | — | Datepicker popup |

**Rule**: Use `rounded-3xl` for any panel or widget card. Use `rounded-xl` for inputs and smaller overlays. Use `rounded-lg` for buttons. Never mix `rounded-2xl` with panel cards.

---

## 3. Font Size Scale (actually used)

| Class | rem / px | Where used |
|-------|----------|-----------|
| `text-sm` | 0.875 rem / 14 px | Progress labels (`Progress: x/y`, percentage readout) |
| `text-base` | 1 rem / 16 px | Body default, `span` global style, streak popup |
| `text-lg` | 1.125 rem / 18 px | Auth button (`.login`), form helper text |
| `text-xl` | 1.25 rem / 20 px | `h3` global, sidebar links, DashboardTab values |
| `text-2xl` | 1.5 rem / 24 px | `h1` global, TaskList "TASKS" label, badge name (fallback state) |
| `text-3xl` | 1.875 rem / 30 px | Streak numbers mobile (`text-3xl lg:text-7xl`), Summary "no tasks" |
| `text-4xl` | 2.25 rem / 36 px | Summary "ALL TASKS: x/y" count, `.pin-button` |
| `text-7xl` | 4.5 rem / 72 px | Streak numbers desktop only (`lg:text-7xl`) |
| `text-[36px]` | 36 px | Bolt icon mobile (`text-[36px] lg:text-[50px]`) |
| `text-[50px]` | 50 px | Bolt icon desktop |
| `text-[80px]` | 80 px | Badge name in BadgeField (desktop) |

**Note**: `text-5xl`, `text-6xl` are absent from the codebase. The jump from `text-4xl` to `text-7xl` is intentional for hero numbers. Do not introduce intermediate steps.

**Font family**: `font-display` (Jockey One) is defined but not yet applied to components — reserved for brand headers. Default is system-ui throughout.

---

## 4. Spacing & Gap Patterns

### Gap (flex/grid)

| Class | px | Context |
|-------|----|---------|
| `gap-1` | 4 px | Very tight: FlameBoxes row, inline micro-elements |
| `gap-2` | 8 px | Close siblings: DashboardTab pill row, icon+label pairs |
| `gap-4` | 16 px | Standard component row spacing (StreakField flex row, inner card rows) |
| `gap-6` | 24 px | Section-to-section (desktop right-column, `#home` `lg:gap-y-6`) |

### Padding (cards and sections)

| Pattern | Where |
|---------|-------|
| `px-4` | Mobile section wrapper side padding (Home.jsx widget wrappers at `< lg`) |
| `px-6` | Card body padding (TaskList `p-6`, Summary `px-6`) |
| `py-2`, `py-3` | Compact card vertical padding (StreakField boxes) |
| `py-8 px-10` | Generous desktop card interior (BadgeField authenticated state) |
| `p-2` / `p-3` | Task list item padding (mobile/desktop) |
| `p-12`, `p-16` | Empty / locked-out state padding |
| `mx-6 mb-6 mt-6` | Standard section margin wrapper (TaskForm inside TaskList) |

### Layout dimensions

| Item | Value |
|------|-------|
| Sidebar expanded | `17rem` (272 px) |
| Sidebar collapsed | `5rem` (80 px) |
| Navbar height | `h-16` (64 px) |

---

## 5. Polish Rules

These patterns are observed consistently across the codebase. Follow them when adding or editing visual elements.

**Borders**
- Every card and interactive container uses `border-2`. Never `border` (1 px) on panels.
- Border color follows semantic state: `border-purpleNormal` (default), `border-purpleBorder` (active/focus), `border-deadlineTheme` (destructive).

**Border radius**
- Panels: `rounded-3xl`. Items inside panels: `rounded-2xl`. Buttons: `rounded-lg`. Full-pill chrome: `rounded-full`.

**Hover transitions**
- Standard hover: `transition-all duration-300 ease-in-out` on task items.
- Fast interactive (buttons): `transition-all duration-75 ease-in`.
- Opacity reveals: `transition-opacity duration-200 ease-out`.
- Icon hover: `scale-105` or `scale-110` + color change; never scale on panels.

**Opacity**
- Secondary/ghost actions default to `opacity-50`, full on hover/active.
- On mobile (touch, no hover), reveal-on-hover patterns must have a visible base state — use `opacity-40` as the mobile floor.

**Responsive breakpoints in use**
- `lg:` (1024 px) — layout mode switch (single-column → two-column grid, sidebar relative vs absolute).
- `md:` (768 px) — typography upscale (`md:text-2xl`), some component padding changes.
- `xl:` (1280 px) — used only for StreakField label text (`2xl:block`). Avoid introducing new `xl:` gates.
- `2xl:` (1536 px) — FlameBox label visibility only. Do not add new breakpoints here.

**Text gradients**
- Pattern: `bg-{gradient-token} bg-clip-text text-transparent` on a `<p>` or `<div>`.
- Used for: streak numbers (fuchsia-400 gradient), badge shimmer border (purpleGradient).

**Dark-only palette**
- The app is dark-mode-only. `color-scheme: dark` is set globally (`index.css`). Never introduce light-mode color values.
- Background depth order: `darkBackground` → `purpleSidebar` → `purpleMain` → `purpleNormal`.

**Animations**
- Use `slime-slidein` for drawer/panel entrance, `slime-fadein` for overlays, `slime-popin` for modals.
- `@media (prefers-reduced-motion: reduce)` disables `.slime-anim-drawer`, `.slime-anim-backdrop`, `.slime-anim-modal` — always use these class names on animated mobile elements.
- `fade-out` (desktop legacy) for exit animations on task removal.
