/** Public facts about Makka Juice. Sources are listed in docs/01-brand-research.md. */

export const BRAND = {
  nameAr: 'عصير مكة',
  nameEn: 'Makka Juice',
  hotline: '17370',
  slogans: {
    cup: 'لو عصير… يبقى مكة',
    campaign: 'مكة على طول',
    origin: 'من قلب اسكندرية',
  },
  /** WhatsApp ordering — from Makka's own Facebook auto-reply (2026-09-28) */
  whatsapp: {
    number: '01117118333',
    link: `https://wa.me/201117118333?text=${encodeURIComponent('أهلاً عصير مكة، عايز أطلب:')}`,
  },
  links: {
    facebook: 'https://www.facebook.com/Makka.Juice/',
    instagram: 'https://www.instagram.com/makkajuiceeg/',
    talabat: 'https://www.talabat.com/ar/egypt/mecca-juicesemouha',
    menu: 'https://sites.google.com/view/makkajuicemenu/home',
    backToSchool: 'https://sites.google.com/view/backtoschoolmenu/',
    branches: 'https://sites.google.com/view/makka-juice-branches/home',
  },
  stats: {
    facebookFollowers: 548_000,
    instagramFollowers: 28_300,
  },
} as const

export interface Branch {
  name: string
  address: string
  phone?: string
  /** Google Maps listing id (CID) — only when matched with evidence (docs/01 → "Google Maps"). */
  cid?: string
}

/** exact Google listing (opens the shop itself, directions one tap away) */
const g = (cid: string) => ({ cid })

export interface City {
  id: string
  name: string
  /** Position on the stylised delta map (see Branches section, viewBox 0 0 900 460) */
  map: { x: number; y: number }
  branches: Branch[]
}

/**
 * Branch list = Makka's own branches page (sites.google.com/view/makka-juice-branches, linked from their Facebook
 * auto-reply, read 2026-09-28). Phones: menuegypt / Facebook. `g(cid)` = exact Google Maps listing (docs/01).
 */
export const CITIES: City[] = [
  {
    id: 'alex',
    name: 'الإسكندرية',
    map: { x: 345, y: 92 },
    branches: [
      { name: 'سموحة ١', address: '١ شارع الطيار محمود شكري', phone: '01158119881', ...g('390279087656240776') },
      { name: 'سموحة ٢', address: 'شارع أدمون فرمون — أمام مدارس مصطفى النجار' },
      { name: 'سبورتنج ١', address: 'شارع الدلتا — أمام ترام سبورتنج', phone: '034272600', ...g('1845285616063350403') },
      { name: 'سبورتنج ٢', address: 'طريق الجيش — بجوار مطعم عم سمير', ...g('6704572313063307024') },
      { name: 'الشاطبي', address: 'أمام مسرح بيرم التونسي', ...g('15216970012538686196') },
      { name: 'ميامي', address: '٧ شارع اسكندر إبراهيم', ...g('801613249222385193') },
      { name: 'العصافرة ١', address: 'على البحر — بعد فندق الوردة البيضاء، أسفل فندق جولدن جويل', phone: '01277010036', ...g('3899208000934600576') },
      { name: 'العصافرة ٢', address: 'شارع جمال عبد الناصر — أمام أسواق الشريف', ...g('992583237965841726') },
      { name: 'شارع ٤٥', address: 'شارع ٤٥ على البحر' },
      { name: 'المعمورة الشاطئ', address: 'شارع النصر — عمارة بورتو المعمورة' },
      { name: 'المندرة', address: 'طريق الكورنيش — أمام فندق القوات المسلحة' },
      { name: 'سان ستيفانو', address: '٣٩٧ طريق الكورنيش — أمام سان ستيفانو مول', ...g('17936132507501401400') },
      { name: 'كامب شيزار', address: '٢١ شارع أحمد قمحة — أمام كلية الهندسة', ...g('17383256845333654551') },
      { name: 'الأزاريطة', address: '٢٥ شارع شامبليون' },
      { name: 'فلمنج', address: 'شارع طمازين' },
      { name: 'العطارين', address: 'العطارين' },
      { name: 'العجمي', address: 'البيطاش — بعد بنك مصر، بجوار قطونيل' },
    ],
  },
  {
    id: 'coast',
    name: 'الساحل الشمالي',
    map: { x: 120, y: 150 },
    branches: [
      { name: 'مارينا ٤', address: 'داخل مارينا ٤ — السوق التجاري', ...g('8240797171788762416') },
      { name: 'الكيلو ٤٠', address: 'كرير — الكيلو ٤٠ مارينا' },
    ],
  },
  {
    id: 'beheira',
    name: 'البحيرة',
    map: { x: 470, y: 150 },
    branches: [{ name: 'دمنهور', address: 'شارع الراهبات — أمام مساكن المحافظ' }],
  },
  {
    id: 'gharbia',
    name: 'الغربية',
    map: { x: 610, y: 205 },
    branches: [{ name: 'طنطا', address: 'شارع الإستاد — أمام ستي كلوب', ...g('16742509064860944600') }],
  },
  {
    id: 'cairo',
    name: 'القاهرة والجيزة',
    map: { x: 690, y: 370 },
    branches: [
      { name: 'فيصل', address: 'التعاون — أمام البنك الأهلي', ...g('8957482628147510338') },
      { name: 'نادي الزمالك', address: 'داخل نادي الزمالك' },
      { name: 'جامعة الأهرام الكندية', address: 'داخل الجامعة — ٦ أكتوبر', ...g('7675675670235682702') },
      { name: 'الشيخ زايد', address: 'وصلة دهشور، المنطقة الرابعة — بجوار بازوكا', ...g('14494253567497727492') },
    ],
  },
]

export const BRANCH_COUNT = CITIES.reduce((n, c) => n + c.branches.length, 0)

/** The branch's own Google listing when we have it, otherwise a Maps search for it. */
export const mapsLink = (branch: Branch, city: City) =>
  branch.cid
    ? `https://maps.google.com/?cid=${branch.cid}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`عصير مكة ${branch.name} ${city.name}`)}`
