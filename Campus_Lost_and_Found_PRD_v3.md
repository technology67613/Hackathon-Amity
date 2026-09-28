# Campus Lost & Found: Product Requirements Document (v3, mockup-driven)

**Build:** 60-minute MVP, solo, laptop demo
**Stack:** Vite + React + TypeScript + Supabase + Tailwind v4 + React Router + lucide-react
**Supersedes:** v1 and v2. The UI now follows your 4 mockups; the features are v2's Smart Match and Claim Verification.

---

## 1. What this version does

1. Rebuilds the UI to match your four mockups: **Home**, **Report an Item**, **Search & Filters**, **Item Details**.
2. Keeps every requirement in the PDF, and where a mockup disagrees with the PDF, the PDF wins (see the decision log).
3. Keeps the two creative features, wearing the mockup's look: **Smart Match** (auto-suggested matches with a % score) and **Claim Verification** (contact stays hidden until a secret question is answered).
4. Uses every file already in your project tree (see section 4).

**Source of truth, in order:** (1) the PDF, (2) the mockups, (3) our creative additions.

---

## 2. Decision log (where sources disagree)

| # | Topic | PDF says | Mockup shows | Decision |
|---|---|---|---|---|
| 1 | Button label on a **Found** card | Contact Finder | Two Found cards (Student ID Card, Mobile Phone) say "Contact Owner" | **PDF wins.** Found = Contact Finder, Lost = I Found This, on every card |
| 2 | Contact details | Just a mailto:/tel: action | Details page shows phone + email openly with Call/Email buttons | **Hidden until unlocked** via Claim Verification (your earlier choice). After unlocking, the card looks exactly like the mockup |
| 3 | Details action label | Example says "Contact Owner" | Primary button says "Contact Owner" | Locked state uses the §3F labels (I Found This / Contact Finder). After unlock the button becomes **Contact Owner** (lost item) or **Contact Finder** (found item) |
| 4 | Contact field | One field: phone / email | Details shows both a phone and an email | Keep **one input**; users may enter both separated by a comma. The details page shows a row for each one entered |
| 5 | App name | "Application name" | "Campus Lost & Found" | Use **Campus Lost & Found** (drop the "FindIt" name) |
| 6 | Filters | Status required, Category optional | Also Priority, Location, Date Range, Sort | Build all. **Priority is derived from category** (section 6.4), not a form field |
| 7 | Images | Not required | Cards show product photos; the form has no upload | **No upload.** Thumbnails come from a keyword to image map with an icon-tile fallback |
| 8 | Details gallery | Not required | Main image + 3 thumbnails | One image only (gallery is a stretch goal) |
| 9 | Sidebar | Not required | Only on the Report page | Sidebar on **Report** and **My Reports**; bottom tab bar on mobile |
| 10 | Header button | Report Item button on dashboard | Search/Details headers show bell + avatar only | Show **Report Item** on every page except /report so users can always report |
| 11 | Avatar "R", bell | Not required | Decorative | No login. Avatar opens **My Reports**. Bell becomes the **match-alert dropdown** |
| 12 | "Location" field | Examples: Library, Block A, Canteen | Free-text input | Free text with a suggestions list (datalist), as in the mockup |

---

## 3. PDF compliance matrix

| PDF ref | Requirement | Where it lives | Acceptance test |
|---|---|---|---|
| §3A | App name, search bar, Report Item button, Lost/Found listings, item cards | Home | All four visible on load |
| §3A | Card: name, status, category, location, date, short description, action button | `ItemCard` | Every card shows all 7 |
| §3B | 7 form fields + Submit Listing, new item appears on dashboard | Report page | Submit, then the new card is first on Home with a highlight pulse |
| §3B | Category options: Electronics, Documents, Accessories, Books, Bags, Other | Report + Search | Exactly these 6 |
| §3C | Search ("wallet" shows wallet listings) | Header + Search page | "wallet" returns the 4 wallet listings |
| §3D | Status All/Lost/Found required; Category optional | Home chips + Search page | Both work and combine |
| §3E | Details on click: item, status, category, location, date, description, action | Item Details page | Date reads "27 September 2026" |
| §3F | Lost = **I Found This**, Found = **Contact Finder**, via mailto:/tel: | Cards + details | Labels match; unlocked links use `mailto:` / `tel:` |
| §3F | No WhatsApp | n/a | Not built |
| §4 | 6-item deliverable checklist | Section 12 | All ticked |

---

## 4. Project structure and how every existing file is used

```
Hackathon-Amity/
├── package.json, package-lock.json     # root: installs @supabase/supabase-js for the shared client
├── src/lib/supabase/client.ts          # THE Supabase client (single source, reused via @lib alias)
└── Amity-Hackathon/                    # the Vite app
    ├── .env                            # NEW: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
    ├── index.html                      # fonts, favicon link, title, meta
    ├── vite.config.ts                  # + tailwind plugin, @lib alias, fs.allow
    ├── tsconfig.app.json               # + @lib path
    ├── README.md                       # rewritten project README (see Appendix B)
    ├── docs/                           # NEW: design + brief reference (not bundled)
    │   ├── Campus_Lost_and_Found_Problem_Statement.pdf
    │   └── mockups/ (home.png, report.png, search.png, details.png)
    ├── public/
    │   ├── favicon.svg                 # tab icon (backpack)
    │   ├── icons.svg                   # SVG sprite used in the footer
    │   └── items/                      # NEW: thumbnails (wallet.png, earphones.png, ...)
    └── src/
        ├── main.tsx                    # Router + providers
        ├── App.tsx                     # route table + layout switch
        ├── index.css                   # Tailwind import, design tokens, fonts, base styles
        ├── App.css                     # component layer: .glass, .card, .pill, animations
        ├── types.ts
        ├── assets/                     # hero.png, react.svg, vite.svg (existing)
        ├── lib/                        # api, match, synonyms, contact, format, priority, images, storage
        ├── context/                    # ItemsContext, ToastContext
        ├── hooks/                      # useDebounce, useFilters
        ├── pages/                      # Home, Report, Search, ItemDetails, MyReports
        └── components/                 # Header, Sidebar, Footer, ItemCard, ItemThumb, StatusPill,
                                        # FilterPanel, ClaimModal, MatchPanel, MatchRing, ContactCard,
                                        # StatsStrip, BellMenu, Toast, EmptyState, Skeleton, ScriptNote
```

| What you already have | Where it is used |
|---|---|
| `src/assets/hero.png` | Faded campus background behind the Home hero (mask + 30% opacity, as in mockup 1). If it is still the default Vite graphic, swap in any campus or building photo under the same filename |
| `src/assets/react.svg`, `vite.svg` | Footer "Built with" chips on every page |
| `public/favicon.svg` | Browser tab icon. If it is the Vite default, replace it with the backpack SVG in Appendix A |
| `public/icons.svg` | Sprite for the footer icons. Open the file and check its symbol ids; the default Vite sprite has `github-icon`, `x-icon`, `discord-icon`, `bluesky-icon`, `documentation-icon`. Use it as `<svg><use href="/icons.svg#github-icon"/></svg>` for the GitHub link |
| `src/index.css` | Tailwind import, colour tokens, fonts, body background gradient |
| `src/App.css` | `.glass`, `.card`, `.pill`, shimmer, pulse, ring animations |
| `src/App.tsx`, `main.tsx` | Route table and providers (replace the template demo code) |
| Root `package.json` + lockfile | Holds `@supabase/supabase-js` for the shared `client.ts` |
| Root `src/lib/supabase/client.ts` | The only Supabase client. Imported as `@lib/supabase/client` |
| The 4 mockups + the PDF | Copied to `docs/` as the acceptance reference |

### 4.1 Setup commands (do this before any AI prompts)

```bash
# 1) Root (for the shared client.ts)
cd Hackathon-Amity
npm i @supabase/supabase-js

# 2) App
cd Amity-Hackathon
npm i react-router-dom lucide-react
npm i -D tailwindcss @tailwindcss/vite
```

`Amity-Hackathon/.env`
```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

`Amity-Hackathon/vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@lib': fileURLToPath(new URL('../src/lib', import.meta.url)) } },
  server: { fs: { allow: ['..'] } },
  optimizeDeps: { include: ['@supabase/supabase-js'] },
})
```

`Amity-Hackathon/tsconfig.app.json` (add to `compilerOptions`, and extend `include`)
```json
"paths": { "@lib/*": ["../src/lib/*"] }
```
```json
"include": ["src", "../src/lib"]
```

**Assumption:** `client.ts` exports `supabase` and reads `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`. If it uses other variable names, either rename the env keys or edit the file.

**Timebox: 3 minutes.** If Vite complains about the alias or "outside of serving allow list", do not debug. Copy `client.ts` to `Amity-Hackathon/src/lib/supabase/client.ts`, change the imports from `@lib/supabase/client` to `./lib/supabase/client`, and move on.

---

## 5. Design system (taken from the mockups)

**Mood:** airy light-blue glassmorphism over a faded campus photo, soft shadows, rounded corners, handwritten script accents.

| Token | Value |
|---|---|
| Page background | vertical gradient `#EAF3FF` to `#F6FAFF` with 2 to 3 large blurred white blobs |
| Ink (headings) | `#0F2A5C` |
| Body text | `#4A5B7A` |
| Muted text/icons | `#8A9BB8` |
| Brand gradient (primary buttons, active chips) | `linear-gradient(135deg, #7C9CFF, #5B7BFA)` |
| Lost pill | text `#E5484D` on `#FDE8EC`, with a red dot on chips |
| Found pill | text `#16A34A` on `#E3F7EC`, with a green dot on chips |
| Match accent (new) | gold `#F5B942` on `#FFF4DA` (ties to Amity's gold; used only for match badges and the unlock moment) |
| Fonts | **Plus Jakarta Sans** (UI), **Caveat** (handwritten notes) via Google Fonts in `index.html` |

`index.css`
```css
@import "tailwindcss";
@theme {
  --color-ink:#0F2A5C; --color-body:#4A5B7A; --color-muted:#8A9BB8;
  --color-brand:#5B7BFA; --color-brand-2:#7C9CFF;
  --color-lost:#E5484D; --color-lost-bg:#FDE8EC;
  --color-found:#16A34A; --color-found-bg:#E3F7EC;
  --color-gold:#F5B942; --color-gold-bg:#FFF4DA;
  --font-sans:'Plus Jakarta Sans',ui-sans-serif,system-ui,sans-serif;
  --font-script:'Caveat',cursive;
}
body{font-family:var(--font-sans);color:var(--color-body);
  background:linear-gradient(180deg,#EAF3FF,#F6FAFF);min-height:100vh}
```

`App.css`
```css
.glass{background:rgba(255,255,255,.58);backdrop-filter:blur(20px) saturate(140%);
  -webkit-backdrop-filter:blur(20px) saturate(140%);
  border:1px solid rgba(255,255,255,.75);
  box-shadow:0 10px 40px rgba(80,120,200,.12);border-radius:24px}
.card{transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-3px);box-shadow:0 16px 44px rgba(80,120,200,.18)}
@media (prefers-reduced-motion:reduce){.card{transition:none}.card:hover{transform:none}}
```

**Component styling**
- **Header:** full-width glass bar, 72px tall, rounded-2xl, with the backpack logo + "Campus Lost & Found" (ink, bold), a centred search pill, the Report Item button, a bell and a round avatar.
- **Cards:** glass, radius 20px, 100px thumbnail on the left, name bold (ink), status pill top-right, 3 meta rows with blue line icons, 2-line description, a full-width outline button (1px brand border, brand text, phone icon).
- **Inputs:** white/70 background, 1px `#DCE6F7` border, 14px radius, leading icon, brand focus ring.
- **Script notes:** Caveat, 26px, `#4A5B7A`, slight rotation (-4deg) with a hand-drawn underline and heart.
- **Icons:** `lucide-react` line icons at 18px (`Tag`, `MapPin`, `Calendar`, `Phone`, `Mail`, `Search`, `Bell`, `Heart`, `Lock`, `Unlock`, `Home`, `PlusCircle`, `SlidersHorizontal`, `Filter`).
- **Motion:** card stagger fade-up (40 ms steps), modal scale-in, skeleton shimmer, new-card pulse, match ring fill (700 ms), lock to unlock swap. Everything respects `prefers-reduced-motion`.
- **Responsive:** grid columns 4 (≥1280px), 3 (≥1024px), 2 (≥700px), 1 below. Touch targets ≥ 44px.

---

## 6. Screen specifications

### 6.1 Global shell
- **Header** on every page (see 5). The search box is the single global query: typing on any page and pressing Enter goes to `/search?q=...`; on `/search` it updates the URL (debounced 250 ms). A clear "x" appears when there is text.
- **Bell:** count badge = number of *your* reported items (from this browser) that currently have at least one possible match. Click opens a dropdown of alerts (6.7).
- **Avatar:** links to My Reports.
- **Sidebar** (Report and My Reports only): Home, Report Item (active state = brand-tinted pill), Browse Listings (goes to `/search`), My Reports. Bottom of the sidebar has the heart plus "Lost something? Found something? Help your campus community!" in script.
- **Footer** on every page: building icon + "Lost something? Found something?" (script) on the left; right: "Campus Lost & Found. Small things. Big stories. ♡" and a small "Built with" row of `react.svg`, `vite.svg` and a GitHub icon from `icons.svg`.
- **Toasts:** bottom-centre glass toasts for success and error.

### 6.2 Home (mockup 1)
- **Hero:** left column with H1 "Lost something? Found something?" (ink, 40px, bold) and sub "Help your campus community get back what matters." Right: script note "Small things make a big difference ♡". Behind the hero, `hero.png` is faded and masked into the page.
- **Status chips:** All (active = brand gradient), Lost (red dot), Found (green dot). They filter Recent Listings in place.
- **Stats strip (compact, right of the chips):** three mini glass pills: *Reported*, *Possible Matches*, *Recovered*.
- **Recent Listings panel:** big glass panel, title with a document icon, "View all →" (goes to `/search`). Shows the **8 newest** by `created_at`, in a 4-column grid.
- **Card behaviors:** click anywhere on the card goes to `/item/:id`. The action button opens the Claim modal directly (stop propagation). Cards with matches show a gold "🎯 N match(es)" chip beside the status pill. Returned items show a green "✅ Recovered" ribbon and a disabled button.
- **States:** skeleton grid while loading; empty state ("Nothing here yet. Be the first to report.") with a Report Item button; error state with Retry.
- **New item:** after reporting, the new card is first and pulses for 2 seconds.

### 6.3 Report an Item (mockup 2)
- **Layout:** sidebar (left), form card (centre), Quick Tips card + script note (right). On mobile the right column stacks below the form.
- **Heading:** "Report an Item" with a document icon. Sub: "Fill in the details below to report a lost or found item. The item will appear on the dashboard once you submit it."
- **Fields** (labels with red asterisks, as in the mockup):

| Field | Control | Validation |
|---|---|---|
| Item Type | Two-part toggle, Lost or Found (default Lost) | required |
| Item Name | text, tag icon, placeholder "e.g. Black Wallet" | 2 to 60 chars |
| Category | select with grid icon, "Select category" | one of the 6 |
| Location | text with pin icon and suggestions (Library, Block A, Block B, Canteen, Main Gate, Gym, Hostel, Ground, Parking, Auditorium) | 2 to 40 chars |
| Date | date input, default today, max today | required |
| Description | textarea, "Add a short description..." | 5 to 200 chars, live counter |
| Contact Information | phone icon, "Phone number or Email" | a 10-digit phone, an email, or both separated by a comma |
| **Verify it's yours** (new) | glass sub-card with a lock icon: Question (with preset chips) + Answer | both required |

- **Verification helper copy (changes with the toggle):**
  - Lost: "Ask something only the person who found it could answer, e.g. 'What sticker is on the back?'"
  - Found: "Ask something only the real owner would know, e.g. 'What's the phone wallpaper?'"
  - Preset chips: "What colour or brand is it?", "What's inside it?", "What's written or stuck on it?", "Any scratch or unique mark?"
  - Note: "We never show your answer or contact until someone answers correctly."
- **Quick Tips card:** the three mockup tips ("Be as detailed as possible (helps with faster recovery)", "Use a clear item name and category", "Add your contact information so the owner can reach you") + a new fourth: "Pick a question only the real owner/finder can answer."
- **Submit Listing** (full-width brand gradient button with a send icon): disabled with a spinner while submitting.
- **On success:** toast "Listing submitted"; save the id to `clf:mine` (localStorage); run Smart Match. If there are matches, open the **Match Panel** (6.7); otherwise go to `/` with the new card pulsing. Match Panel "View" goes to that item; "Skip for now" goes to `/`.
- **Prefill:** `/report` accepts router state `{category, location}` (used by "Report Similar Item").

### 6.4 Search & Filters (mockup 3)
- **Header:** "Search & Filters" with a magnifier icon, sub "Find lost items or help someone get their belongings back.", script note "Search. Filter. Reunite. ♡".
- **Left panel (results):**
  - Row: large search input (with clear x), Status select (All / Lost / Found), Category select, and a filter icon button (on mobile it opens the Filters drawer).
  - "Search Results (N items)" and "Sort by: [Newest First | Oldest First | Best Match]" (Best Match only enabled when a query exists).
  - Results in a 2-column grid of horizontal cards (same card as Home).
- **Right panel (Filters, glass):** title with a funnel icon, "Clear All" link; sections Status (segmented All / Lost / Found), Category (select), Priority (radios All / High / Medium / Low), Location (select of distinct locations in the data), Date Range (select: Any Date, Today, Last 7 days, Last 30 days), and a full-width **Apply Filters** button.
- **Behavior:** all filters apply **live** and are stored in the URL (`?q=&status=&category=&priority=&location=&range=&sort=`), so a link reproduces the view. "Apply Filters" closes the drawer on mobile and scrolls to the results. "Clear All" resets everything but the query.
- **Priority (derived from category, not stored):** High = Documents, Electronics; Medium = Accessories, Bags; Low = Books, Other.
- **Search matching:** the query is split into words; every word must match (substring) somewhere in name + description + category + location, after synonym expansion (7.3). Ranking: name match > description > location/category. "wallet" returns the four wallet listings.
- **Empty state:** "No matches for 'xyz'. Try fewer words or Clear All", plus a Report Item button.

### 6.5 Item Details (mockup 4)
- **Breadcrumb:** "← Back to Listings > Item Details" (back goes to the previous page, else `/`).
- **Left main card:** one large image with the heart (save toggle, stored in `clf:saved`). Right of the image: status pill, item name (H1), then rows with icons: Category, Location, Date (`27 September 2026`), Description, and an **Additional Information** info box:
  - Lost: "This item was lost on campus. If you've found it, answer one question to contact the owner."
  - Found: "This item was found on campus. If it's yours, answer one question to contact the finder."
- **Right column, Contact card** (title "Contact Owner" for lost, "Contact Finder" for found):
  - **Locked (default):** phone row shows `+91 98••• ••210`, email row shows `a•••@college.edu`, each with a disabled Call / Email button and a small lock. The primary button reads **I Found This** (lost) or **Contact Finder** (found) and opens the Claim modal. Helper text: "Answer 1 question to unlock contact details."
  - **Unlocked (this session only):** full phone and email, Call (`tel:`) and Email (`mailto:?subject=Campus Lost & Found: <name>`) buttons enabled, primary button becomes **Contact Owner** (lost) or **Contact Finder** (found) and dials the phone (or opens the email if no phone). An "OR" divider and a **Send Email** outline button follow. Hide any channel the poster did not provide.
  - **Returned:** card shows "✅ Already recovered" and all buttons are disabled.
- **Quick Actions card:**
  - **Mark as Found** (for a lost item; "Mark as Returned" for a found item), with the sub-line "(if you are the owner)" or "(if you are the finder)". Visible and enabled only if this browser reported the item **or** unlocked it in this session; otherwise disabled with the tooltip "Only the person who reported this can mark it." Calls `mark_returned`.
  - **Report Similar Item** (sub-line "if you found something else"): goes to `/report` with the category and location prefilled.
- **Possible Matches section (new, only when matches exist):** heading "🎯 Possible Matches"; up to 3 compact cards, each with a match ring.
- **More Items from Campus:** 4 compact cards (same category first, then newest), each with a **View Details** outline button; "View All →" goes to `/search`.
- **Not found:** if the id is unknown, show "This listing isn't available" with a Back to Listings button.

### 6.6 My Reports
Same card grid, filtered to ids in `clf:mine`, with tabs All / Lost / Found. Each card has a small "Possible matches: N" line. Empty state: "You haven't reported anything on this device yet." (Data is device-local because there is no login; say so on the page.)

### 6.7 Modals and overlays
- **Claim modal** (glass, centred): lock icon; item name; the question in a highlighted block; answer input (autofocus, Enter submits); **Verify** button with a spinner; 3 attempt dots.
  - Correct: lock morphs to unlock with a short gold burst, then the modal closes and the Contact card updates in place.
  - Wrong: input shakes and shows "Not quite. Try again." (dots fill).
  - 3 wrong: "Too many tries. Please try again later." The input is disabled for this item for the browser session (`sessionStorage`).
  - Esc or backdrop closes; focus returns to the trigger.
- **Match Panel** (full-screen glass overlay after a report): headline "🎯 We found N possible matches!", sub "Someone may already have reported this." Up to 3 match cards, each with thumbnail, name, status pill, location, date, an animated ring (score %), and a **View** button. "Skip for now" link at the bottom.
- **Bell dropdown:** lists your reported items that have matches: "Your lost *Black Wallet* may match a found *Brown Wallet* (55%)", click goes to that item. Empty: "No new matches yet. We check whenever you open the app."
  - *Honest scope:* alerts are computed in the browser when the app loads, gets focus, or after a report. There are no push notifications.
- **Toast:** success (green check) and error (red), auto-dismiss after 3.5 s.

---

## 7. Creative features

### 7.1 Smart Match
Compares each **Lost** item with each **Found** item (never the same type, never returned items). Score 0 to 100, capped at 100.

| Signal | Points |
|---|---|
| Same category | 30 |
| Word overlap of name + description, after synonym normalisation | up to 40 |
| Same location (case-insensitive, trimmed) | 15 |
| Dates within 3 days of each other | 15 |

- **Text overlap** uses the *overlap coefficient*: `|A ∩ B| / min(|A|, |B|)`, multiplied by 40. It is fairer than Jaccard for short descriptions.
- **Tokenising:** lowercase, split on non-letters, drop stop-words (`a an the with in of and near on at is has was found lost small one`), strip a trailing "s" (cards → card), then map synonyms to a canonical word.
- **Possible Match = score ≥ 50.** Results are sorted by score, highest first.
- Only public fields are used, so matching never touches contact details.
- **Seeded examples** (so the feature is visible immediately):
  - Student ID Card (found) ↔ Student ID Wallet (lost): about 100%
  - White Earphones (found) ↔ White AirPods (lost): about 88%
  - Black Wallet (lost) ↔ Brown Wallet (found): about 55%

### 7.2 Claim Verification
- The poster writes a question and answer when reporting. The **contact and the answer live only in a private database table** the browser cannot read; the browser reads a public view without them.
- Verification runs in a database function, `claim_item(id, answer)`, which returns the contact only when the answer matches. Matching is case-insensitive after trimming; it accepts an exact match or one contained in the other when at least 3 characters long.
- Unlocked contacts are kept **in memory only** (never in localStorage), so a page reload asks again.
- **Known limits (say these out loud if asked):** attempts are limited on the client only; server-side rate limiting and a proper Supabase Auth login are the next steps.

### 7.3 Search synonyms (tiny, high-impact)
| Canonical | Also matches |
|---|---|
| earphones | earphone, earbuds, earbud, airpods, headphones, headset |
| phone | mobile, iphone, smartphone, cellphone |
| bag | backpack, bagpack, satchel, purse |
| bottle | flask, tumbler, sipper |
| keys | key, keychain |
| wallet | purse, billfold |
| id | idcard, identity |
| laptop | notebook, macbook |

Search and Smart Match both use this table (`lib/synonyms.ts`).

---

## 8. Data and backend (Supabase)

Run this whole block in the Supabase SQL Editor. It drops any earlier `items` table.

```sql
drop view if exists items_public;
drop table if exists items cascade;

create table items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('lost','found')),
  name text not null,
  category text not null check (category in
    ('Electronics','Documents','Accessories','Books','Bags','Other')),
  location text not null,
  date date not null,
  description text,
  contact text not null,
  question text not null,
  answer text not null,
  returned boolean not null default false,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: the public cannot read or write this table directly
alter table items enable row level security;

-- Public-safe view: no contact, no answer
create view items_public as
  select id, type, name, category, location, date, description,
         question, returned, created_at
  from items;
grant select on items_public to anon, authenticated;

create or replace function norm(t text) returns text
language sql immutable as
$$ select lower(regexp_replace(trim(coalesce(t,'')), '\s+', ' ', 'g')) $$;

create or replace function report_item(
  p_id uuid, p_type text, p_name text, p_category text, p_location text,
  p_date date, p_description text, p_contact text,
  p_question text, p_answer text
) returns void
language sql security definer set search_path = public as
$$
  insert into items(id,type,name,category,location,date,description,
                    contact,question,answer)
  values (p_id,p_type,p_name,p_category,p_location,p_date,p_description,
          p_contact,p_question,norm(p_answer));
$$;

create or replace function claim_item(p_id uuid, p_answer text)
returns text
language plpgsql security definer set search_path = public as
$$
declare a text; c text; g text;
begin
  select answer, contact into a, c from items where id = p_id;
  g := norm(p_answer);
  if a is not null and g <> '' and (
       g = a
       or (length(g) >= 3 and position(g in a) > 0)
       or (length(a) >= 3 and position(a in g) > 0)
     ) then
    return c;
  end if;
  return null;
end
$$;

create or replace function mark_returned(p_id uuid) returns void
language sql security definer set search_path = public as
$$ update items set returned = true where id = p_id $$;

grant execute on function report_item, claim_item, mark_returned to anon, authenticated;

-- Seed data: the exact items in your mockups (+3 to make matches visible)
insert into items (type,name,category,location,date,description,contact,question,answer,created_at) values
('lost','Black Wallet','Accessories','Canteen','2026-09-27','Black leather wallet with college ID inside.','+91 98765 43210, abc123@college.edu','Whose name is on the college ID inside?','rahul', now() - interval '1 hour'),
('found','White Earphones','Electronics','Library','2026-09-25','White wireless earphones (left one has a small scratch).','9988776655','Which earphone has the scratch, left or right?','left', now() - interval '2 hours'),
('lost','Blue Backpack','Bags','Block A','2026-09-24','Blue backpack with a denim keychain.','pack.owner@college.edu','What kind of keychain hangs on the zip?','denim', now() - interval '3 hours'),
('found','Student ID Card','Documents','Main Gate','2026-09-22','College ID card (R. Sharma).','9123456780','Which course is printed on the card?','bca', now() - interval '4 hours'),
('lost','Water Bottle','Other','Gym','2026-09-20','Blue steel water bottle with sticker.','9555512345','What is on the sticker?','panda', now() - interval '5 hours'),
('found','Books','Books','Library','2026-09-18','Two textbooks (Data Structures & OS).','books.found@college.edu','Whose name is on the first page?','ankit', now() - interval '6 hours'),
('lost','Keys','Accessories','Canteen','2026-09-16','Car keys with a blue keychain.','9000011111','Which car brand is the key for?','hyundai', now() - interval '7 hours'),
('found','Mobile Phone','Electronics','Block B','2026-09-15','iPhone (black cover).','9222233333','What is on the lock-screen wallpaper?','sunset', now() - interval '8 hours'),
('found','Brown Wallet','Accessories','Library','2026-09-24','Brown wallet with cash and cards.','brown.wallet@college.edu','How much cash is inside?','500', now() - interval '20 hours'),
('found','Ladies Wallet','Accessories','Block A','2026-09-20','Small black wallet with zipper.','9333344444','What colour is the zipper pull?','gold', now() - interval '21 hours'),
('lost','Student ID Wallet','Documents','Main Gate','2026-09-22','Wallet with student ID and college cards.','9444455555','Which department is printed on the ID?','commerce', now() - interval '22 hours'),
('lost','White AirPods','Electronics','Library','2026-09-24','White wireless earbuds in a small case.','airpods.lost@college.edu','What sticker is on the case?','star', now() - interval '23 hours');
```

The first 8 rows get the newest `created_at`, so Home shows exactly the 8 cards in mockup 1, in the same order. Searching "wallet" returns the 4 wallets in mockup 3.

**Client calls** (all in `src/lib/api.ts`, importing `supabase` from `@lib/supabase/client`)
- `fetchItems()`: `supabase.from('items_public').select('*').order('created_at', { ascending: false })`
- `reportItem(input)`: `supabase.rpc('report_item', { p_id: crypto.randomUUID(), ... })`. The id is made in the browser so no row needs returning; add the new item to local state immediately.
- `claimItem(id, answer)`: `const { data } = await supabase.rpc('claim_item', { p_id: id, p_answer: answer })`. `data` is a contact string or `null`.
- `markReturned(id)`: `supabase.rpc('mark_returned', { p_id: id })`.

---

## 9. Frontend architecture

**Routes**
| Path | Page |
|---|---|
| `/` | Home |
| `/report` | Report an Item |
| `/search` | Search & Filters (also "Browse Listings") |
| `/item/:id` | Item Details |
| `/my-reports` | My Reports |
| `*` | Redirect to `/` |

**Types (`types.ts`)**
```ts
export type ItemType = 'lost' | 'found'
export type Category = 'Electronics'|'Documents'|'Accessories'|'Books'|'Bags'|'Other'
export interface Item {
  id: string; type: ItemType; name: string; category: Category; location: string
  date: string; description: string; question: string; returned: boolean; created_at: string
}
export interface Match { item: Item; score: number }
export interface ReportInput {
  type: ItemType; name: string; category: Category; location: string; date: string
  description: string; contact: string; question: string; answer: string
}
```

**State**
- `ItemsContext`: `items`, `loading`, `error`, `refresh()`, `addLocal(item)`, `markReturnedLocal(id)`, `matchesFor(id)`, `totalMatches`. Matches are computed once with `useMemo` over all items (n is small). Refetch on window focus.
- Search filters: **URL search params** are the single source of truth, read through `hooks/useFilters.ts` (debounced query).
- Session state: unlocked contacts `Map<id, string>` in memory; wrong-attempt counts in `sessionStorage` (`clf:attempts:<id>`).
- localStorage keys: `clf:mine` (ids you reported), `clf:saved` (hearted ids). Never store contact details.

**Library modules (`src/lib/`)**
| File | Exports |
|---|---|
| `api.ts` | `fetchItems`, `reportItem`, `claimItem`, `markReturned` |
| `match.ts` | `THRESHOLD = 50`, `scorePair(a, b)`, `getMatches(item, all)`, `countMatchedItems(all)` |
| `synonyms.ts` | `SYNONYMS`, `tokenize(text)`, `expandQuery(q)` |
| `contact.ts` | `parseContact(raw) -> {phones, emails}`, `maskPhone`, `maskEmail`, `telHref`, `mailHref(email, itemName)` |
| `format.ts` | `fmtShort` ("27 Sep 2026"), `fmtLong` ("27 September 2026") |
| `priority.ts` | `priorityOf(category)` |
| `images.ts` | `getItemImage(item)`: keyword to `/items/<file>.png` (wallet, earphones, backpack, id-card, bottle, books, keys, phone); returns `null` if none |
| `storage.ts` | helpers for `clf:mine`, `clf:saved`, attempt counters |

**Thumbnails:** `ItemThumb` renders the mapped image, and if there is none (or it fails to load) shows a soft blue gradient tile with the category's lucide icon, so cards never look broken.

**Edge cases**
| Case | Behavior |
|---|---|
| Contact has only an email or only a phone | Show only that row and button |
| Invalid contact | Inline error, submit blocked |
| Future date | Blocked by `max` and validation |
| Very long name or description | Truncate on cards (line-clamp), full on details |
| Supabase down or bad key | Error state with Retry; Report form shows an error toast and keeps the input |
| Double submit | Button disabled while submitting |
| Deleted or unknown item id | "This listing isn't available" page |
| Returned item | No contact action, no matches, "✅ Recovered" ribbon |

---

## 10. Priority tiers and the 60-minute plan

**Tiers** (what to cut if you run out of time, from the bottom up)
- **P0 (PDF must-haves, 100% required):** dashboard, report form, search, status filter, details, contact action with the exact labels, data in Supabase.
- **P1 (mockup fidelity):** glass style, header, hero image, 4 pages, category filter, sort, thumbnails, footer.
- **P2 (creative, in this order):** Smart Match (badges + Match Panel), Claim Verification.
- **P3 (nice-to-have):** priority/location/date filters, bell alerts, My Reports, heart save, Report Similar Item, Mark as Found, stats strip, synonyms.

| Time | Task | Tier |
|---|---|---|
| 0 to 6 | Setup (section 4.1), run the SQL, verify `items_public` returns rows | P0 |
| 6 to 16 | Prompt 1: shell, tokens, header, Home with cards | P0/P1 |
| 16 to 24 | Prompt 2: Report page + submit | P0 |
| 24 to 32 | Prompt 3: Search & Filters | P0/P1 |
| 32 to 42 | Prompt 4: Item Details + Contact card + Claim modal | P0/P2 |
| 42 to 50 | Prompt 5: Smart Match + Match Panel + badges + bell | P2/P3 |
| 50 to 56 | Prompt 6: polish, mobile, README | P1 |
| 56 to 60 | Rehearse the demo once, no new code | n/a |

**Rules:** after each prompt, run the app and click through before moving on. If Prompt 4 runs past minute 45, skip the bell and stats and do Smart Match only. If you are behind at minute 40, use the fallback: show the contact after clicking the action button (no claim), and present Claim Verification as the next step.

---

## 11. Build prompts (attach the named mockup image to each prompt)

### Prompt 1: shell, design system, Home (attach mockup 1)
> This is a Vite + React + TS app in `Amity-Hackathon` (Tailwind v4 already installed, react-router-dom and lucide-react installed). Recreate the attached **Home** mockup pixel-faithfully. Replace the Vite template code. Put Tailwind import, colour tokens and fonts (Plus Jakarta Sans, Caveat via Google Fonts in `index.html`) in `index.css`; `.glass`, `.card`, `.pill` and animations in `App.css`. Set up React Router in `main.tsx` with routes `/`, `/report`, `/search`, `/item/:id`, `/my-reports` (only Home built now, others placeholder). Build `Header` (backpack logo + "Campus Lost & Found", search pill, Report Item gradient button, bell, avatar), `Footer` (with `src/assets/react.svg` and `vite.svg` as "Built with" chips and a GitHub icon from `/icons.svg`), `ItemCard`, `ItemThumb` (image from `/items/*.png` by keyword, else a gradient tile with a category icon), `StatusPill`, `ScriptNote`. Home: hero with H1 "Lost something? Found something?", `src/assets/hero.png` as a faded masked background, status chips All/Lost/Found with coloured dots, and a "Recent Listings" glass panel showing the 8 newest items in a 4-column grid with skeleton loading, empty and error states. Cards: thumbnail, name, status pill, category, location, date as "27 Sep 2026", 2-line description, and a full-width outline button labelled **I Found This** for Lost and **Contact Finder** for Found. Load data from `items_public` via `src/lib/api.ts` importing `supabase` from `@lib/supabase/client`. Wrap in an `ItemsContext`. Fully responsive.

### Prompt 2: Report page (attach mockup 2)
> Build the **Report an Item** page to match the attached mockup: left sidebar (Home, Report Item active, Browse Listings, My Reports; bottom tab bar on mobile), centred form card, right Quick Tips card and a script note. Fields: Item Type toggle (Lost/Found), Item Name, Category select (Electronics, Documents, Accessories, Books, Bags, Other), Location (text with datalist: Library, Block A, Block B, Canteen, Main Gate, Gym, Hostel, Ground, Parking, Auditorium), Date (default today, max today), Description (5 to 200 chars with counter), Contact Information (10-digit phone, email, or both comma-separated). Add a glass sub-card "Verify it's yours" with a Question (preset chips: "What colour or brand is it?", "What's inside it?", "What's written or stuck on it?", "Any scratch or unique mark?"; helper copy changes with Lost/Found) and an Answer. Button **Submit Listing**. Inline validation. On submit call `reportItem` (rpc `report_item` with `p_id: crypto.randomUUID()`), add the item to context immediately, save its id to `localStorage` key `clf:mine`, toast "Listing submitted", navigate to `/` where the new card pulses for 2 s. Accept router state `{category, location}` as prefill.

### Prompt 3: Search & Filters (attach mockup 3)
> Build `/search` to match the attached mockup. Left panel: search input with clear x, status select, category select, filter-icon button (opens the filters drawer on mobile), "Search Results (N items)", "Sort by" select (Newest First, Oldest First, Best Match), 2-column result grid using the same `ItemCard`. Right glass Filters panel: Status segmented, Category select, Priority radios (All/High/Medium/Low, derived: High = Documents+Electronics, Medium = Accessories+Bags, Low = Books+Other), Location select (distinct locations from data), Date Range select (Any Date, Today, Last 7 days, Last 30 days), **Apply Filters** and **Clear All**. All filters apply live and live in the URL search params (`q, status, category, priority, location, range, sort`). The header search box drives the same `q` (Enter on other pages navigates to `/search?q=`). Implement `lib/synonyms.ts` (earphones/earbuds/airpods, phone/mobile/iphone, bag/backpack, bottle/flask, keys/key/keychain, wallet/purse, id/identity, laptop/notebook) and match every query word by substring across name + description + category + location. "wallet" must return 4 items. Home "View all" and the sidebar "Browse Listings" go here.

### Prompt 4: Item Details + Claim Verification (attach mockup 4)
> Build `/item/:id` to match the attached mockup: breadcrumb "Back to Listings > Item Details", main card with large image, heart (saved in localStorage `clf:saved`), status pill, name, Category / Location / Date (as "27 September 2026") / Description rows and an Additional Information box; right column **Contact card** and **Quick Actions**; below, "More Items from Campus" (4 compact cards, same category first) with View Details buttons. The Contact card must be **locked by default**: show masked phone/email (`+91 98••• ••210`, `a•••@college.edu`) with disabled Call/Email buttons and a primary button **I Found This** (lost) or **Contact Finder** (found) that opens a `ClaimModal`. The modal shows the item's question, an answer input, Verify, and 3 attempt dots; call `claimItem` (rpc `claim_item`); wrong shows "Not quite. Try again." with a shake; 3 wrong locks the item for the session (`sessionStorage`); correct plays a lock-to-unlock animation, stores the returned contact **in memory only**, and updates the card to show the full contact with working `tel:` and `mailto:` buttons, the primary button renamed **Contact Owner** (lost) / **Contact Finder** (found), an OR divider and **Send Email**. Hide channels that were not provided. Quick Actions: **Mark as Found** ("if you are the owner", or "Mark as Returned" for found items), enabled only if the id is in `clf:mine` or unlocked this session, calling `markReturned`; and **Report Similar Item**, which goes to `/report` with category and location prefilled. Use the same wiring on the card action buttons on Home and Search.

### Prompt 5: Smart Match + alerts
> Create `src/lib/match.ts` with `scorePair(a, b)` and `getMatches(item, all)`. Only compare lost with found, skip returned items. Score 0 to 100 (cap 100): same category +30; text overlap up to +40 using the overlap coefficient `|A∩B| / min(|A|,|B|)` on tokens from name + description (lowercase, split on non-letters, drop stop-words `a an the with in of and near on at is has was found lost small one`, strip a trailing "s", map synonyms via `lib/synonyms.ts`); same location (case-insensitive) +15; dates within 3 days +15. A possible match is score >= 50, sorted high to low. Then: show a gold "🎯 N matches" chip on cards; add a "🎯 Possible Matches" section (up to 3 cards with animated SVG percentage rings) on the details page; after submitting a report, open a full-screen glass **MatchPanel** ("🎯 We found N possible matches!") with the top 3 matches, each with a **View** button, and a "Skip for now" link; make the bell show a badge with the number of the user's own reported items (from `clf:mine`) that have matches, with a dropdown listing them; add a compact stats strip on Home (Reported, Possible Matches, Recovered). Matches are computed in a `useMemo` in `ItemsContext`.

### Prompt 6: Polish and README (attach all 4 mockups)
> Compare each page with its mockup and fix spacing, radii, colours, icon sizes and typography differences. Add card fade-up stagger, modal scale-in, skeleton shimmer and `prefers-reduced-motion` handling. Check 375px, 768px and 1440px widths. Add a **My Reports** page (cards for ids in `clf:mine`, tabs All/Lost/Found, empty state) and make the avatar link to it. Add a 404 redirect. Rewrite `README.md` with: what the app is, feature list against the PDF checklist, screenshots from `docs/mockups`, setup steps, env vars, the Supabase SQL location, and a "How Smart Match and Claim Verification work" section. Do not add new dependencies.

---

## 12. QA checklist, risks and demo

**PDF deliverables (§4)**
- [ ] 1. Dashboard with app name, search bar, Report Item button, item cards
- [ ] 2. Report form with all 7 fields; new item appears on dashboard
- [ ] 3. Search works ("wallet" returns 4)
- [ ] 4. Status filter All / Lost / Found (+ category filter)
- [ ] 5. Item details view on click
- [ ] 6. Contact action: **I Found This** / **Contact Finder** via `mailto:` / `tel:` (after verification)

**Creative and polish**
- [ ] Home shows the same 8 cards as mockup 1 in the same order
- [ ] Match chips visible on seeded pairs (ID Card/ID Wallet, Earphones/AirPods, Black/Brown Wallet)
- [ ] Network tab for `items_public` shows no `contact` or `answer`
- [ ] Wrong answer x3 locks the item; correct answer ("rahul" for Black Wallet) unlocks
- [ ] Works on a 375px-wide screen

**Risks and fixes**
| Risk | Fix |
|---|---|
| `@lib` alias or `fs.allow` error | Timeboxed fallback: copy `client.ts` into the app (section 4.1) |
| Env vars undefined | Restart `npm run dev` after creating `.env`; keys must start with `VITE_` |
| Empty list but no error | `items_public` needs `grant select`; re-run the SQL block |
| `report_item` rpc fails | Check the parameter names start with `p_`, and that the category is one of the 6 |
| No thumbnails yet | Tile fallback still looks intentional; add PNGs to `public/items/` later |
| Time overrun | Cut from the bottom of the tiers list; never cut P0 |

**Demo script (2 minutes, laptop)**
1. **Problem (10s):** "Lost items on campus today live in WhatsApp group chaos."
2. **Home (15s):** show the dashboard, then type "wallet" to land on Search and show 4 results and the filters.
3. **Report (35s):** report a **Found** "Black Leather Wallet", Accessories, Canteen, today, "Black wallet with an ID card", question "Whose name is on the ID?", answer "Rahul". Submit.
4. **Match Panel (20s):** "We found a possible match: your Black Wallet at about 90%." Explain the 4 signals in one sentence, then click View.
5. **Claim Verification (30s):** on the lost Black Wallet, the phone and email are masked. Click **I Found This**, answer wrong once, then "Rahul". The lock opens; show the Call / Email buttons.
6. **Close (10s):** click Mark as Found and watch Recovered go up. "Contact details never leave the database until you prove you're the right person."

**Likely judge questions**
- *Is the matching AI?* Transparent rule-based scoring: instant, free and explainable. Text embeddings are the next step.
- *Can someone brute-force the answer?* The client locks after 3 tries; server-side rate limiting and login are next.
- *Why hide contacts?* It stops scammers and spam and protects students' phone numbers.
- *Does the bell send notifications?* It updates when the app loads or regains focus; push and email alerts are next.

**Out of scope (say "next steps"):** login, photo upload, in-app chat, push/email notifications, admin moderation, WhatsApp (the brief says skip it).

---

## Appendix A: backpack logo / favicon (use if `favicon.svg` is still the Vite default)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#7C9CFF"/><stop offset="1" stop-color="#2E4FBF"/>
  </linearGradient></defs>
  <path d="M22 16a10 10 0 0 1 20 0" fill="none" stroke="#2E4FBF" stroke-width="4" stroke-linecap="round"/>
  <rect x="12" y="16" width="40" height="42" rx="14" fill="url(#g)"/>
  <rect x="21" y="22" width="22" height="7" rx="3.5" fill="#fff" fill-opacity=".35"/>
  <rect x="20" y="34" width="24" height="16" rx="6" fill="#fff" fill-opacity=".85"/>
  <path d="M26 42h12" stroke="#2E4FBF" stroke-width="3" stroke-linecap="round"/>
</svg>
```

## Appendix B: README outline
1. Title + one-line pitch and a screenshot
2. Problem (from the PDF) and solution
3. Features mapped to the PDF checklist
4. Creative features: Smart Match, Claim Verification (with the security explanation)
5. Tech stack
6. Setup: clone, `npm i` in root and in `Amity-Hackathon`, `.env`, run the SQL, `npm run dev`
7. Project structure
8. Roadmap (login, photos, notifications, embeddings)
