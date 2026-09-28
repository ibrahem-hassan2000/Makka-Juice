# 01 — Brand research (captured 2026-09-27)

## Who they are
- **عصير مكة — Makka Juice** (logo reads "Mecca Juice"). Juice, cocktail & dessert chain from **Alexandria, Egypt**.
- Described by listing sites as "أشهر محل عصائر في الإسكندرية" with a big range of cocktails & juices (aklaa.com).
- Facebook category: "طاولة العصير والسموزي". Page address: **Smouha, Alexandria**. Listed as "open always".
- **Hotline 17370** — one number for all branches (on every post, menu back cover, cover photo).
- Facebook page phone: 012 77010036.

## Audience & reach
| Channel | Handle | Numbers (2026-09-27) |
|---|---|---|
| Facebook | facebook.com/Makka.Juice | **548K followers** |
| Instagram | @makkajuiceeg | 28.3K followers, 888 posts; bio links the Google-Sites menu |
| Instagram (older) | @makkajuice | exists, less active |
| Talabat | "عصير مكه — سموحة" | delivery, rated "رهيب" |
| Menu site | sites.google.com/view/makkajuicemenu/home | 12 image pages (source of our menu data) |

No official website — the only "site" is the Google-Sites menu.

## Slogans & voice (verbatim from their material)
- **«لو عصير يبقى مكة»** — printed on the cup and the menu cover. Core line.
- **«مكة على طول»** — current bottled / Back-to-School campaign (cover photo).
- **«من قلب اسكندرية للشيخ زايد»** — Instagram post on the Sheikh Zayed opening.
- «طعم لوليتا بتاع زمان رجع تاني من عصير مكة» — FB post (Sept 2026) → the Lolita slush is back.
- «دايما متجمعين على عصير مكة», «خبر عاجل عصير مكة بقي في زايد… بخصم 50%» — casual, Egyptian, playful.
- Instagram highlights: Location · breastcancer🩷 · Juice Making.

## Visual identity observed
- **Logo:** green roundel, two hurricane glasses (orange→red and pink/red), cocktail umbrellas (blue/teal), "Mecca" / "Juice" on the arc, «عصير مكة» in white below.
- **Greens:** bright leaf/lime green (menu background ≈ #5CB646), deep forest green (menu back cover ≈ #0B4A2E).
- **Accents on the printed menu:** red section titles on white brush strokes, orange (small) / red (large) / white (bottle) price pills.
- **Type on menu:** rounded heavy Arabic display (Baloo-like).
- **Cup:** clear plastic, dark-green **wavy-line band** + «لو عصير / يبقى / مكة» stacked; **pink straw**.
- **Bottles:** clear PET, bright green caps, label «مكة على طول» (cover photo, five flavours: vanilla/cream, mango, berry, peach, strawberry).
- **Storefront:** green fascia with white «عصير مكة» lettering.
- Back cover: dark green with white fruit line-icons pattern + "17370 Hotline" with a phone/umbrella mark.

## Branches (menuegypt.com, updated 2026-06-13, + FB/IG posts)
Alexandria: Smouha 1 (El Tayyar Mahmoud Shukry St., opp. Smouha Club — 01158119881 / mat3am: 01117118333), Smouha 2
(Edmond Fermon St.), Sporting 1 (Delta St. — 034272600 / 034248085), Sporting 2 (El Geish Rd.), San Stefano
(397 Corniche, opp. San Stefano Mall — hours Sun–Thu 7am–11pm, Fri–Sat 10am–11pm per Welp), Asafra (Corniche —
01277010036), Shatby, Miami, Maamoura, Mandara, Camp Shezar, Azarita, Fleming, Attarin, Agamy.
North Coast: Marina 4, Kilo 40 (Kerir). Beheira: Damanhour. Gharbia: Tanta. Cairo/Giza: **Abbasiya (first Cairo
branch)**, Faisal, 6th of October (Ahram Canadian University), **Sheikh Zayed (newest, opened with 50% off)**.
→ encoded in `src/data/brand.ts` (23 branches, 5 governorates).

Not ours: "عصائر مكة" Helwan / Mansheya listings on yellowpages are different shops with a similar name.

### Official branches page (authoritative from 2026-09-28)
Makka's Facebook auto-reply sends: menu https://sites.google.com/view/makkajuicemenu/home · Back to School menu
https://sites.google.com/view/backtoschoolmenu/ · branches https://sites.google.com/view/makka-juice-branches/home ·
hotline 17370 · **WhatsApp ordering https://wa.me/201117118333**. The branches page lists **25 branches** →
`src/data/brand.ts` now follows it: added العصافرة ٢ (جمال عبد الناصر أمام أسواق الشريف), شارع ٤٥ على البحر,
نادي الزمالك; **العباسية is not on it** (removed; a Google listing «Makka Juice» in Abbasiya still exists — ask);
corrected دمنهور «شارع الراهبات أمام مساكن المحافظ», طنطا «أمام ستي كلوب», الشيخ زايد «وصلة دهشور المنطقة الرابعة
بجوار بازوكا», فلمنج «شارع طمازين», العجمي «بجوار قطونيل». The page has no map links.

### Google Maps listings (checked 2026-09-28, maps "limited view", no login)
Update later the same day with the official addresses: **14 of 25 linked** — the 11 below plus
العصافرة ٢ («عصير مكة» متفرع من جمال عبد الناصر, ~70 m from أسواق الشريف, cid 992583237965841726),
جامعة الأهرام الكندية (listing located in the university, cid 7675675670235682702) and
مارينا ٤ (listing located in Marina 4 commercial market, cid 8240797171788762416).
Still unlinked: سموحة ٢، شارع ٤٥، المعمورة الشاطئ، المندرة، الأزاريطة، فلمنج، العطارين، العجمي، الكيلو ٤٠،
دمنهور، نادي الزمالك.
«عصير مكة» is a common shop name, so a listing is only linked when something ties it to *our* branch (same
street / building number / landmark, or the listing names the branch). Linked by CID (`maps.google.com/?cid=…`) in
`src/data/brand.ts` → the card's «الاتجاهات» opens the shop itself.

| Branch | Google listing (address · rating) | Why we trust it | CID |
|---|---|---|---|
| سموحة ١ | الشهيد طيار محمود شاكر عبد المنعم · 4.4 (1,142) | same street (El-Tayar) | 390279087656240776 |
| سبورتنج ١ | 2 الدلتا · 4.2 (715), open 24 h | Delta St. | 1845285616063350403 |
| سبورتنج ٢ | «عصير مكة (كورنيش سبورتنج)» 171 طريق الجيش | name + road | 6704572313063307024 |
| سان ستيفانو | «Makka juice عصير مكة» 397 شارع الكازينو | same number 397 | 17936132507501401400 |
| العصافرة | 730 طريق الجيش | corniche, next to Golden Jewel | 3899208000934600576 |
| الشاطبي | «عصائر مكة» 16 عبد المعطي الخيال · 4.4 (819) | ~150 m from Bayram El-Tonsy theatre | 15216970012538686196 |
| ميامي | «مكة للعصائر» 7X9V+QJC ميامي · 4.2 (617), 03 5921484 | Miami, open 24 h | 801613249222385193 |
| كامب شيزار | 6W4G+X9F راكوتيس · 4.2 (60) | next to the Faculty of Engineering | 17383256845333654551 |
| طنطا | «عصير مكة طنطا» شارع الاستاد | name + Stadium St. | 16742509064860944600 |
| فيصل | «عصير مكة فرع فيصل» شارع الملك فيصل | names the branch | 8957482628147510338 |
| الشيخ زايد | «Makka juice (عصير مكة)» Qubix Hub, Dahshour Rd · 4.4 (24) | 2 listings same spot | 14494253567497727492 |

**Not confirmed — ask the client** (candidates found, but nothing ties them to Makka):
سموحة ٢ (maybe «قرية مبارك الأولمبية» 4.5 (1,985), cid 6984595621961006241) · المعمورة / المندرة (one listing
72QM+479 المندرة بحري 4.3 (965), cid 8191931509040379691 — which of the two?) · فلمنج (41 El-Fath, cid
14412132625645061852) · العطارين («عصير مكه Mekka Juice» إسماعيل مهنا, cid 1499756483820334559) · العجمي (البيطاش
4Q9R+C2C, 1 review, cid 15043484809694490139) · دمنهور (2 candidates: عبد السلام الشاذلي / الجمهورية) · العباسية
(144 سوق العباسية, cid 5543679701539058615) · not found: الأزاريطة، مارينا ٤، الكيلو ٤٠، ٦ أكتوبر (ACU).
Those branches keep a Google Maps *search* link until confirmed.

## Menu
Full menu transcribed from the 12 official menu images → [03-menu-data.md](03-menu-data.md).
Signature names worth featuring: العتيل، الإمبراطور، الساحر، أبو السلاطين، تايجر كينج، الكينج، ديناميت، شيكو، لوليتا،
كنافة دبي، رشدي أباظة، أبوتريكة…

## Unknown (ask the client)
Founding year · founder story · exact recipes of signatures · official logo vector & fonts · brand colour codes ·
opening hours per branch · WhatsApp ordering · delivery zones · photos/videos rights.

## Sources
- https://www.facebook.com/Makka.Juice/ (page info, cover, posts)
- https://www.instagram.com/makkajuiceeg/
- https://sites.google.com/view/makkajuicemenu/home (official menu)
- https://menuegypt.com/makka-juice (branches)
- https://aklaa.com/Alexandria/Makka-Juice (description, categories)
- https://welpstar.com/en/biz/makka-juice-عصير-مكة/branches (San Stefano hours)
- https://www.mat3am.net/restaurant/31770/Makka-Juice-Al-Shatibi (Smouha address/phone)
- https://www.talabat.com/ar/egypt/mecca-juicesemouha
