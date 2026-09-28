# Makka Juice (عصير مكة) — concept website

Spec pitch site for an Alexandria juice chain. Not approved by the client yet. **Start by reading `docs/README.md`.**

- Stack: Vite 8 · React 19 · TS · Tailwind 4 (`@theme` tokens in `src/index.css`) · GSAP 3.15 (+ScrollTrigger/SplitText/DrawSVG) · Lenis · Motion.
- RTL Arabic page (`<html lang="ar" dir="rtl">`). Horizontal scroll moves **right** in RTL.
- Content lives only in `src/data/*` (menu, brand/branches, signatures). Artwork is hand-built SVG in `src/components/art`.
- Current design = v1 (SVG juice-builds-itself hero, Baloo Bhaijaan 2). A cinematic v2 was tried and reverted by the
  user — don't reintroduce it unless asked.
- GSAP gotchas: never put Tailwind `translate-*` classes on elements GSAP animates (GSAP reads them as px offsets —
  position with an outer wrapper). SplitText on Arabic: always `wordsClass: 'split-word'` (padded masks keep dots).
- Anything that changes page height is picked up by the ResizeObserver in App.tsx → `ScrollTrigger.refresh()`.
- Perf: nothing inside onUpdate may measure (no DrawSVG `gsap.set` per frame, `getPointAtLength`, `clientWidth`) —
  sample once, cache sizes in a ResizeObserver. Animate HTML layers over static SVG. Rules in docs/04.
- Display type = Makka sticker (`sticker()` from `components/ui/sticker.ts`); fruit decoration = `ui/Floaters`.
- Sticky UI uses `top-(--nav-offset)`; Header sets `html[data-nav]`.
- Don't invent brand facts; mark placeholders. Update `docs/08-changelog.md` at the end of every session.
- Dev server: `.claude/launch.json` → `makka-dev` on port 5190. Build: `npm run build`.
