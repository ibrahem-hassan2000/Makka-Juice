# 03 — Menu data

- Source: official menu images at https://sites.google.com/view/makkajuicemenu/home (cover + 10 menu pages + back
  cover, 875×1241). First transcribed 2026-09-27; **re-checked line by line on 2026-09-28** against every page
  (the user reported wrong names) → `src/data/menu.ts`.
- **21 categories, 471 items** (`MENU_ITEM_COUNT`). Prices in EGP. Back to School menu (separate site):
  https://sites.google.com/view/backtoschoolmenu/ — linked from the Bottles section, not transcribed.

## Model
```ts
MenuCategory { id, title, sizes: string[], tone, items: { name, prices: (number|null)[] }[] }
```
- Cold drinks: sizes **`شوب / شبح / زجاجة ٩٠٠`** (printed columns: orange / red / white pills). The middle size is
  «شبح» — the site said «شيخ» until 2026-09-28 (the user caught it; the menu also sells «كوب بلاستيك شبح»).
- Hot drinks: `وسط / كبير`. Desserts & boxes: `شوب / شبح`. Hot dishes: column «صغير» (the «كبير» column is empty).
  Add-ons: one price.
- `null` = "-" on the printed menu (size not offered).
- Names are spelled **as printed** (e.g. «كرتادو», «اسبرسو», «اسبريد بوستاشيو», «الحرنكش», «زبادي فواكة»), except
  that hamza forms are kept standard (أ/إ) — search ignores them anyway.
- Text after «=» or in brackets is shown as a small ingredients line under the name in the menu UI
  («سفنجة = أناناس» → سفنجة / أناناس, «كاكاو (سوبيا خروب)» → كاكاو / سوبيا خروب).

## 2026-09-28 re-check — what changed
- **Prices: all correct.** Only names/rows changed.
- Renamed to match the print: hot drinks (نسكافية، اسبرسو، فرابية، كرتادو، اسبانش لاتيه، هوت شوكلت), iced coffee
  («ايس …», and «كراميل ميكاتو» without «ايس»), milks use «&» between flavours, «بلوسكاي», «الليمون نعناع» (greens),
  «سوبيا فراولة (سكلانس فراولة)», «سوبيا مانجو (سكلانس مانجو)», «سوبيا بلح = بلح», «أبوتريكة ميكس بطيخ فراولة»,
  desserts (بوستاشيو، مالتيزر، راس بيري، رد فلفت، تريليتش), add-ons (مكسرات مكس، مكسرات سوداني حب، اسبريد …،
  إضافة فواكه …).
- **Boxes («علب مكة»): I had invented a «فواكه» prefix** («فواكه توت»…) — removed; the menu says «توت، خوخ، مانجو، ميكس…».
- Added (were missing): «فريسكا» (20), «فلوتس كيك» (40), «علبة مشكل كراميل بودينج أرز» (27), and the add-ons
  cups (كوب بلاستيك صغير/شوب/شبح), chocolate pieces (أوريو، هوهوز وتوينكز، براونيز، سنيكرز، نسكافية، كيت كات،
  مالتيزر، مورو) and water bottles.

## Still to confirm with Makka
- Rows printed **without a price** (left out): «مكسرات & العاشورة», «كريم شانتيه شوكولاتة», «كاستر جيلي»,
  «تريليتش تشيز بلوبيري», and a second «ارز باللبن ايس كريم» at 60 (we keep the 40 one).
- «إضافة فواكه جرنشة» is printed — kept as «حرنكش» (almost certainly a typo).
- Items printed with «؟» (روناتس؟ ريسباسيتو؟ ساندوتش حلو؟ طاطا ؟) kept verbatim.
- **What's inside the signatures** (العتيل، الإمبراطور، الساحر…): not published anywhere (menu, Talabat, aklaa,
  mat3am checked). Card taglines + layer colours stay placeholders until the client sends recipes.
- Multi-flavour rows («حليب & مانجو & …») = one price for any of the listed flavours.
- Prices can differ per branch — the site says so under the menu.

## Updating prices
Edit `src/data/menu.ts` only. Search, counts, signatures (`src/data/signatures.ts` reads prices by name) update automatically.
If a signature is renamed on the menu, rename it in `signatures.ts` too or its prices go empty.
