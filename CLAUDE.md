# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (default http://localhost:5173)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the production build locally
- `npm run lint` — ESLint over the repo

There is no test framework configured. Verify changes by running the dev server and inspecting the affected section in the browser.

`node scripts/generate-depth.mjs` — one-time offline generator for the hero portrait's depth map (see Hero depth portrait below). Not part of the build.

## Architecture

Single-page React 19 portfolio built with Vite 7 and Tailwind 4, using heavy client-side 3D (Three.js via `@react-three/fiber` + `@react-three/drei`) and GSAP animation. The whole app is a vertical stack of sections rendered by `src/App.jsx`; `src/sections/*` are the page sections and `src/components/*` are their building blocks. Section content/data lives centrally in `src/constants/index.js`.

The dominant design concern throughout is **keeping multiple WebGL scenes cheap enough to run on one page (especially on mobile)**. Most non-obvious code exists to serve that goal:

### Two-tier lazy loading + loader gate (`src/App.jsx`)
- **Priority tier** (`Hero`, `ShowcaseSection`, `SplashCursor`): their `import()` promises are fired eagerly at module load, then wrapped in `React.lazy`. `Promise.all` on those promises gates `priorityLoaded`, which drives `InitialLoader`.
- **Secondary tier** (everything below the fold): plain `lazy(() => import(...))`, and additionally gated behind `{!showLoader && ...}` so they don't even start fetching until the loader is gone.
- `sessionStorage['portfolio_has_seen_loader']` skips the loader (and its stall) on repeat visits within a session.
- Every lazy section is wrapped in `<Suspense fallback={null}>`.

### Manual vendor chunking (`vite.config.js`)
`three`/`@react-three/*` → `three-vendor`, `gsap`/`motion` → `animation-vendor`, `react`/`react-dom` → `react-vendor`. Any new Three.js import lands in `three-vendor` automatically; keep it that way.

### 3D performance patterns (follow these when adding/editing 3D)
- **`src/hooks/useInViewFrameloop.js`** returns `[ref, frameloop]`. Attach `ref` to the Canvas wrapper and pass `frameloop` (`"always"`/`"never"`) to `<Canvas>` so the render loop fully stops while the section is scrolled offscreen. Used by every section-level Canvas.
- **Share one WebGL context across many objects** with drei `<View>` + `<View.Port />`, not one `<Canvas>` per object. See `TechStack.jsx` + `models/tech_logos/TechIconCardExperience.jsx` — the comment notes that five separate contexts crashed mobile tabs. Interaction (drag-to-rotate) is done per-object from an R3F pointer event rather than `OrbitControls`, so only the object under the finger moves.
- **Cap `dpr`** hard on phones (`dpr={isMobile ? 1 : [1, 1.5]}`) — the main scroll-jank lever.
- **Detect mobile** two ways: `useMediaQuery({ query: "(max-width: 768px)" })` (react-responsive) inside components, and a synchronous `window.innerWidth <= 768` check in `App.jsx` so GPU-heavy effects (`SplashCursor`) never mount even for one render on mobile.

### Hero depth portrait (`src/components/Heromodels/DepthPortrait.jsx`)
The hero's interactive "3D self-portrait" is not a real model — it's the photo `public/images/sujans05.webp` rendered on a displaced plane in a custom `ShaderMaterial`, using a grayscale depth map `public/images/sujans05-depth.webp`. The depth map is produced offline by `scripts/generate-depth.mjs` (Depth-Anything-V2 via `@huggingface/transformers`, post-processed with `sharp`). Key shader detail: displacement is faded to zero at the photo's alpha edge so the silhouette doesn't tear when it rotates — preserve that when touching the shaders. If the depth texture is missing at runtime the plane renders flat, so likeness never breaks.

### Assets
Static assets live in `public/` (`public/images/`, `public/models/*.glb`) and are referenced by absolute URL string (`/images/...`, `/models/...`) — no import. There is no `src/assets`.

### Conventions
- Animations use `useGSAP` (`@gsap/react`) with GSAP `ScrollTrigger` keyed to section `id`s; className hooks like `.tech-card`, `.hero-text h1` are the animation targets.
- Note the file `src/sections/FeactureCards.jsx` is misspelled but imported under that exact name — don't "fix" the path without updating the import in `App.jsx`.
