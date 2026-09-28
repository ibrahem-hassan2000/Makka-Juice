import type { IconKey } from '../components/art/icons'
import { normalizeAr } from '../lib/utils'
import { MENU } from './menu'

/**
 * Which icons sit next to a menu item: every ingredient word found in the name, in reading order
 * (max 3, e.g. «فراولة موز» → strawberry + banana). Dishes (أرز باللبن، وافل…) show one icon only.
 * No match → the category's icon.
 */
const KEYWORDS: Array<[string, IconKey]> = [
  // fruit
  ['مانجو', 'mango'], ['فراوله', 'strawberry'], ['برتقال', 'orange'], ['يوسفي', 'orange'], ['ليمون', 'lemon'],
  ['كيوي', 'kiwi'], ['افوكادو', 'avocado'], ['موز', 'banana'], ['نعناع', 'mint'], ['جرجير', 'arugula'],
  ['توت', 'berries'], ['بلوبيري', 'berries'], ['بلو سكاي', 'berries'], ['بلوسكاي', 'berries'], ['بطيخ', 'watermelon'], ['رمان', 'pomegranate'],
  ['عنب', 'grapes'], ['دعنوب', 'grapes'], ['تفاح', 'apple'], ['سيدر', 'apple'], ['اناناس', 'pineapple'],
  ['بلح', 'dates'], ['تمر', 'dates'], ['دوم', 'dates'], ['عناب', 'dates'], ['جوافه', 'guava'], ['كريز', 'cherry'],
  ['خوخ', 'peach'], ['مشمش', 'apricot'], ['برقوق', 'plum'], ['كنتالوب', 'cantaloupe'], ['تين شوكي', 'pricklyPear'],
  ['دراجون', 'dragon'], ['حرنكش', 'physalis'], ['باشون', 'passion'], ['جوز هند', 'coconut'], ['جزر', 'carrot'],
  ['بنجر', 'beet'],
  // sweets
  ['شوكولاته', 'chocolate'], ['شوكليت', 'chocolate'], ['كاكاو', 'chocolate'], ['خروب', 'chocolate'], ['نوتيلا', 'chocolate'],
  ['كيت كات', 'chocolate'], ['تويكس', 'chocolate'], ['سنيكرز', 'chocolate'], ['مالتيزر', 'chocolate'], ['مورو', 'chocolate'],
  ['براونيز', 'chocolate'], ['كيندر', 'chocolate'], ['كتاكيتو', 'chocolate'], ['روشيه', 'chocolate'], ['هوهوز', 'chocolate'],
  ['توينكز', 'chocolate'], ['اوريو', 'cookie'], ['بوريو', 'cookie'], ['لوتس', 'cookie'], ['بسكوت', 'cookie'],
  ['فسدق', 'nuts'], ['بستاشيو', 'nuts'], ['بوستاشيو', 'nuts'], ['بندق', 'nuts'], ['كاجو', 'nuts'], ['لوز', 'nuts'], ['سوداني', 'nuts'],
  ['مكسرات', 'nuts'], ['حلاوه', 'nuts'],
  // dairy & co
  ['ايس كريم', 'iceCream'], ['كونو', 'iceCream'], ['زبادي', 'yogurt'], ['حليب', 'milk'], ['ميلك', 'milk'], ['لبن', 'milk'],
  ['سريلاك', 'milk'], ['سوبيا', 'milk'], ['شانتيه', 'cream'], ['قشطه', 'cream'], ['كريمه', 'cream'], ['عسل', 'honey'],
  ['كراميل', 'honey'],
  // hot
  ['قهوه', 'coffee'], ['نسكافيه', 'coffee'], ['اسبريسو', 'coffee'], ['اسبرسو', 'coffee'], ['كرتادو', 'coffee'], ['ميكاتو', 'coffee'], ['كابتشينو', 'coffee'],
  ['لاتيه', 'coffee'], ['موكا', 'coffee'], ['كورتادو', 'coffee'], ['كورتو', 'coffee'], ['فرابيه', 'coffee'],
  ['فلات وايت', 'coffee'], ['امريكانو', 'coffee'], ['شوكلت', 'chocolate'], ['كوفي', 'coffee'], ['شاي', 'tea'], ['اعشاب', 'tea'],
  ['قرفه', 'cinnamon'], ['جنزبيل', 'cinnamon'], ['عرقسوس', 'cinnamon'],
  // dishes
  ['كريم كراميل', 'bowl'], ['ارز', 'bowl'], ['مهلبيه', 'bowl'], ['بودينج', 'bowl'], ['كاستر', 'bowl'], ['جيلي', 'bowl'], ['عاشوراء', 'bowl'],
  ['ام علي', 'bowl'], ['بليله', 'bowl'], ['كسكسي', 'bowl'], ['قشطوطه', 'bowl'], ['ترايفل', 'bowl'], ['طاجن', 'bowl'],
  ['كنافه', 'bowl'], ['فخفخينه', 'bowl'], ['قنبله', 'bowl'], ['كيك', 'cake'], ['تورته', 'cake'], ['تشيز', 'cake'],
  ['هريسه', 'cake'], ['بسبوسه', 'cake'], ['رونات', 'cake'], ['وافل', 'waffle'], ['فريسكا', 'waffle'], ['ساندوتش', 'waffle'],
]

const SOLO = new Set<IconKey>(['bowl', 'cake', 'waffle', 'coffee', 'tea', 'iceCream'])

const CATEGORY_ICON: Record<string, IconKey> = {
  fresh: 'cup',
  signature: 'signature',
  mixes: 'cup',
  rada3at: 'milk',
  milks: 'milk',
  chocolate: 'chocolate',
  borio: 'cookie',
  yogurt: 'yogurt',
  nuts: 'nuts',
  greens: 'arugula',
  smoothie: 'berries',
  sunshine: 'orange',
  herbal: 'cinnamon',
  classic: 'dates',
  hot: 'coffee',
  'iced-coffee': 'coffee',
  desserts: 'bowl',
  boxes: 'waffle',
  'ice-cream': 'iceCream',
  'hot-dishes': 'bowl',
  addons: 'cream',
}

const NORMALIZED = KEYWORDS.map(([word, icon]) => [normalizeAr(word), icon] as const)

function resolve(name: string, categoryId: string): IconKey[] {
  const n = normalizeAr(name)
  const found = NORMALIZED.map(([w, icon]) => [n.indexOf(w), icon] as const)
    .filter(([at]) => at >= 0)
    .sort((a, b) => a[0] - b[0])
  const icons: IconKey[] = []
  for (const [, icon] of found) {
    if (icons.includes(icon)) continue
    if (SOLO.has(icon)) return icons.length ? icons : [icon]
    icons.push(icon)
    if (icons.length === 3) break
  }
  return icons.length ? icons : [CATEGORY_ICON[categoryId] ?? 'cup']
}

/** Pre-computed once — the menu is static. */
const TABLE = new Map<string, IconKey[]>()
for (const c of MENU) for (const it of c.items) TABLE.set(`${c.id}:${it.name}`, resolve(it.name, c.id))

export const iconsFor = (categoryId: string, name: string) => TABLE.get(`${categoryId}:${name}`) ?? ['cup']

/** Tab icon for a whole category — the fresh-juice tabs get their headline fruit. */
const TAB_ICON: Record<string, IconKey> = { ...CATEGORY_ICON, fresh: 'mango', mixes: 'strawberry', greens: 'lemon' }
export const categoryIcon = (categoryId: string): IconKey => TAB_ICON[categoryId] ?? 'cup'
