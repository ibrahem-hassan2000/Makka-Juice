# 02 — Brand identity (as built)

The site speaks Makka's own visual language: the greens of the logo and printed menu, the rounded heavy Arabic
type of the menu, the orange / red / white price pills, the clear cup with the dark-green wave print and pink straw.

> History: a "cinematic / editorial" v2 was tried on 2026-09-27 and **reverted the same day** at the user's request —
> this v1 direction is the chosen one. See 08-changelog.

## Colour tokens (`src/index.css @theme`)
| Token | Hex | Use |
|---|---|---|
| forest-950 / 900 / 800 / 700 | #04200f / #062e18 / #0b4a2e / #11603a | backgrounds, print green |
| leaf-600 / 500 / 400 / 300 | #2f8f3f / #46a843 / #5cb646 / #8fd16f | brand greens (menu bg ≈ leaf-400) |
| lime | #c6f36b | accent, highlights, CTA |
| mango | #f7a531 | small-size price pill, accents |
| berry | #e8505b | large-size price pill, section accents |
| straw | #f48fb1 | the pink straw |
| cream | #fff8e7 | text on dark, cream topping, bottle pill |
| cocoa | #4a2c1d | chocolate categories |

## Type
**Baloo Bhaijaan 2** (variable 400–800, self-hosted via Fontsource) — rounded and heavy like the printed menu.
Headlines 800, body 400–600.

## Illustration
Hand-built SVG (no image requests): fruits (strawberry, mango, orange/lemon slice, kiwi, avocado, banana, mint,
blueberries, ice), the Makka cup (layered liquid, wave print, «لو عصير يبقى مكة», pink straw), the «مكة على طول»
bottle, and a vector recreation of the logo roundel. Fruit-doodle pattern from the menu back cover as a subtle texture.
45 light flat icons for menu rows/tabs (`art/icons.tsx`). Map doodles (`art/mapArt.tsx`, sticker style with dark
outline): lighthouse (Alexandria), beach umbrella (Sahel), palm (Beheira), dome + minaret (Tanta), pyramids (Cairo),
sailboat, and the Makka delivery scooter.
Corniche scene (`art/corniche.tsx` + `sections/Corniche.tsx`): Qaitbay silhouette, double-lantern corniche lamps,
the yellow-and-cream tram, stars; the Makka shop (green fascia + sticker sign, striped awning with bulbs, bananas
hanging at the entrance, cups on the counter, a fruit crate). Sunset palette → the brand's green night.

## Sticker type (the site's display voice — loved by the user, 2026-09-27)
The footer wordmark look: juicy fill + outline + hard edge underneath (`sticker-text` utility in index.css, presets
in `components/ui/sticker.ts`). `light` outline = cream rim, for dark sections; `dark` outline = forest rim + edge,
for cream / coloured sections. Used for: nav wordmark (`brand/Wordmark.tsx`, with a strawberry + orange perched on
it), hero «يبقى مكة» + finale «مكة على طول», one accent phrase per section heading (`SectionHeading accent=`),
«أساطير مكة», signature card names, menu category titles (in the category's tone colour), the branches city title,
«عطشان؟», the footer wordmark. Keep it to display words — never body text.

## Floating fruit
Flat icons (`art/icons.tsx`) drifting with scroll in the empty corners of sections (`ui/Floaters.tsx`), bobbing
around the wordmarks (footer, nav, mobile menu, 17370). Always decoration: behind content, never covering copy.

## "Juicy" type (17370 + story counters)
After the lime liquid fills the number, each digit becomes its own juice with a tone-on-tone fruit print:
1 strawberry red · 7 mango · 3 kiwi green · 7 orange · 0 blueberry purple (cream rim, dark edge), fruit lands on it.
The user loved it → reused on the story counters (each ends as a juice that contrasts with its card).
Code: `ui/juice.ts` (colours + fruit-print tiles) and `ui/JuicyText.tsx` (fill layer over a dark edge layer).

## Price pills (same system as the printed menu)
orange = شوب / وسط · red = شبح / كبير · white = زجاجة ٩٠٠.

## Voice
Egyptian Arabic, warm and cheeky like their posts («اسحب لتحت واتفرج», «شاليمو بمبي»).
Copy is **placeholder until Makka approves it** (see 06).
