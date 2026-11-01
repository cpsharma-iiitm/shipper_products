// DEV FIXTURES — product catalogue source data (pure data, no imports, so it can also be run in Node).
//
// 126 products: Haldi 12, Shampoo 24, Cosmetics 32, Grocery 28, Personal Care 30 — the totals shown
// in the design's category filter and the admin "All products" card. The first six codes (HL001,
// SH002, PC003, CO004, GR005, PC006) and their prices, stock, PV, batch and HSN are copied from the
// design; the other 120 are generated placeholders. Photography is placeholder imagery cropped from
// the Figma file. Everything here is ASSUMPTION — confirm with backend team.

export const CATEGORY_META = {
  haldi: {
    name: 'Haldi',
    prefix: 'HL',
    gst: 5,
    hsn: '091030',
    family: ['haldi'],
    tile: 'haldi-jar',
    description: 'Golden turmeric, pure and fresh from the hills.',
  },
  shampoo: {
    name: 'Shampoo',
    prefix: 'SH',
    gst: 18,
    hsn: '330510',
    family: ['shampoo'],
    tile: 'shampoo-tile',
    description: 'Botanical hair care for everyday shine.',
  },
  cosmetics: {
    name: 'Cosmetics',
    prefix: 'CO',
    gst: 18,
    hsn: '330410',
    family: ['lip'],
    tile: 'lip-tile',
    description: 'Small luxuries for your daily ritual.',
  },
  grocery: {
    name: 'Grocery',
    prefix: 'GR',
    gst: 5,
    hsn: '100630',
    family: ['basmati'],
    tile: 'basmati-tile',
    description: 'Honest pantry staples, everyday nourishment.',
  },
  'personal-care': {
    name: 'Personal Care',
    prefix: 'PC',
    gst: 18,
    hsn: '330499',
    family: ['facewash', 'lotion'],
    tile: 'facewash-tile',
    description: 'Thoughtfully chosen for your daily rituals.',
  },
}

// Image keys are file names under src/mocks/assets/products (resolved to URLs in catalog.js).
export const IMAGE_FAMILIES = {
  haldi: { card: 'haldi-card', cardAlt: 'haldi-card-alt', square: 'haldi-square', squareAlt: 'haldi-square-alt', extra: ['haldi-bowl', 'haldi-field'] },
  shampoo: { card: 'shampoo-card', cardAlt: 'shampoo-card-alt', square: 'shampoo-square', squareAlt: 'shampoo-square-alt', extra: ['shampoo-square-2'] },
  facewash: { card: 'facewash-card', cardAlt: 'facewash-card-alt', square: 'facewash-square', squareAlt: 'facewash-square-alt', extra: ['facewash-square-2'] },
  lip: { card: 'lip-card', cardAlt: 'lip-card-alt', square: 'lip-square', squareAlt: 'lip-square-2', extra: ['lip-square-2'] },
  basmati: { card: 'basmati-card', cardAlt: 'basmati-card-alt', square: 'basmati-square', squareAlt: 'basmati-square-2', extra: ['basmati-square-2'] },
  lotion: { card: 'lotion-card', cardAlt: 'lotion-card-alt', square: 'lotion-square', squareAlt: 'lotion-square-2', extra: ['lotion-square-2'] },
}

// Each base line produces two products (a small and a large size) unless noted.
// [name, unitA, mrpA, unitB, mrpB, discountPercent, extras]
const SHAMPOO = [
  ['Botanical Repair Shampoo', '250 ml', 350, '500 ml', 620, 20],
  ['Neem Anti-Dandruff Shampoo', '250 ml', 320, '500 ml', 560, 18],
  ['Aloe Hydrate Shampoo', '250 ml', 300, '500 ml', 540, 20],
  ['Argan Shine Shampoo', '250 ml', 420, '500 ml', 740, 22],
  ['Onion Hair-Fall Shampoo', '250 ml', 380, '500 ml', 680, 20],
  ['Rose Water Gentle Shampoo', '250 ml', 340, '500 ml', 600, 15],
  ['Coconut Milk Shampoo', '250 ml', 330, '500 ml', 580, 20],
  ['Amla Shikakai Shampoo', '250 ml', 290, '500 ml', 520, 17],
  ['Tea Tree Scalp Shampoo', '250 ml', 400, '500 ml', 700, 20],
  ['Kids Gentle Shampoo', '200 ml', 260, '400 ml', 460, 15],
  ['Keratin Smooth Shampoo', '250 ml', 480, '500 ml', 850, 25],
  ['Herbal Volume Shampoo', '250 ml', 310, '500 ml', 550, 20],
]

const COSMETICS = [
  ['Everyday Rose Lip Tint', '4 g', 450, '2 × 4 g', 800, 20],
  ['Matte Lip Crayon', '3 g', 380, '2 × 3 g', 700, 20],
  ['Kajal Intense Black', '0.35 g', 180, '2 × 0.35 g', 330, 17],
  ['Compact Powder Natural', '9 g', 340, '18 g', 600, 20],
  ['Liquid Foundation', '30 ml', 650, '50 ml', 980, 20],
  ['BB Cream SPF 30', '30 g', 520, '50 g', 800, 15],
  ['Gel Eyeliner', '4 g', 300, '2 × 4 g', 540, 20],
  ['Mascara Volume', '8 ml', 420, '2 × 8 ml', 760, 18],
  ['Nail Enamel Set', '3 × 6 ml', 360, '6 × 6 ml', 660, 20],
  ['Blush Stick', '6 g', 400, '2 × 6 g', 720, 20],
  ['Highlighter Glow', '8 g', 450, '2 × 8 g', 800, 22],
  ['Vitamin C Serum', '30 ml', 750, '50 ml', 1100, 20],
  ['Hydrating Face Cream', '50 g', 480, '100 g', 800, 20],
  ['Sunscreen SPF 50', '50 g', 420, '100 g', 700, 20],
  ['Rose Water Toner', '100 ml', 280, '200 ml', 480, 20],
  ['Under-Eye Cream', '15 g', 520, '30 g', 900, 15],
]

// [name, unitA, mrpA, unitB, mrpB, discount, hsn]
const GROCERY = [
  ['Wholegrain Basmati Rice', '1 kg', 220, '5 kg', 1050, 18, '100630'],
  ['Whole Wheat Atta', '1 kg', 60, '5 kg', 280, 15, '110100'],
  ['Toor Dal', '500 g', 95, '1 kg', 180, 15, '071360'],
  ['Moong Dal', '500 g', 90, '1 kg', 170, 15, '071331'],
  ['Chana Dal', '500 g', 80, '1 kg', 150, 12, '071320'],
  ['Masoor Dal', '500 g', 75, '1 kg', 140, 12, '071340'],
  ['Cold-Pressed Mustard Oil', '500 ml', 170, '1 L', 320, 15, '151491'],
  ['Cold-Pressed Groundnut Oil', '500 ml', 210, '1 L', 400, 15, '150810'],
  ['Forest Honey', '250 g', 280, '500 g', 520, 20, '040900'],
  ['Jaggery Powder', '500 g', 90, '1 kg', 170, 12, '170199'],
  ['Himalayan Pink Salt', '500 g', 70, '1 kg', 130, 10, '250100'],
  ['Assam Tea Leaves', '250 g', 190, '500 g', 360, 15, '090240'],
  ['Filter Coffee Blend', '250 g', 260, '500 g', 490, 18, '090121'],
  ['Rolled Oats', '500 g', 120, '1 kg', 220, 15, '110412'],
]

const PERSONAL_CARE = [
  ['Gentle Aloe Face Wash', '100 ml', 300, '200 ml', 520, 20, 'facewash'],
  ['Coconut Nourish Body Lotion', '200 ml', 400, '400 ml', 700, 20, 'lotion'],
  ['Sandalwood Bathing Bar', '100 g', 120, '3 × 100 g', 330, 15, 'lotion'],
  ['Neem Handwash', '250 ml', 150, '500 ml', 270, 15, 'facewash'],
  ['Herbal Toothpaste', '100 g', 110, '2 × 100 g', 200, 12, 'facewash'],
  ['Roll-on Deodorant', '50 ml', 220, '2 × 50 ml', 400, 20, 'lotion'],
  ['Shea Body Butter', '100 g', 450, '200 g', 800, 20, 'lotion'],
  ['Aloe Vera Gel', '150 ml', 200, '300 ml', 350, 20, 'facewash'],
  ['Hand Cream', '50 g', 180, '100 g', 320, 17, 'lotion'],
  ['Foot Cream', '50 g', 190, '100 g', 340, 17, 'lotion'],
  ['Body Powder (Talc-free)', '100 g', 160, '200 g', 290, 15, 'lotion'],
  ['Herbal Mouthwash', '250 ml', 210, '500 ml', 380, 15, 'facewash'],
  ['Almond Hair Oil', '100 ml', 240, '200 ml', 420, 20, 'lotion'],
  ['Relaxing Massage Oil', '100 ml', 260, '200 ml', 460, 20, 'lotion'],
  ['Sensitive Shaving Gel', '100 g', 200, '200 g', 360, 15, 'facewash'],
]

// Haldi is listed explicitly: [name, unit, mrp, price]
const HALDI = [
  ['Lakadong Haldi Powder', '200 g', 150, 120],
  ['Lakadong Haldi Powder', '500 g', 350, 280],
  ['Lakadong Haldi Powder', '100 g', 90, 72],
  ['Organic Turmeric Powder', '200 g', 125, 100],
  ['Raw Turmeric Root', '250 g', 180, 150],
  ['Golden Milk Haldi Blend', '150 g', 260, 210],
  ['Haldi Chandan Ubtan', '100 g', 220, 175],
  ['Haldi & Honey Wellness Jar', '250 g', 380, 320],
  ['Haldi Tea Infusion', '25 bags', 240, 200],
  ['Turmeric Pickle (Amba Haldi)', '300 g', 200, 170],
  ['Haldi Kumkum Pooja Pack', '100 g', 50, 40],
  ['Haldi Neem Face Pack', '80 g', 260, 220],
]

const roundToFive = (value) => Math.round(value / 5) * 5

// Facts taken from the design for the six hero products (admin table, product page, cart, store operation).
const DESIGN = {
  HL001: { stock: 148, pv: 12, batch: 'HL1026', hsn: '091030', rating: 4.8, reviewCount: 128, bin: 'A-01-03', weightKg: 0.2 },
  SH002: { stock: 86, pv: 28, batch: 'SH0926', hsn: '330510', rating: 4.7, reviewCount: 96, bin: 'B-02-01', weightKg: 0.3 },
  PC003: { stock: 64, pv: 24, batch: 'PC1026', hsn: '330499', rating: 4.6, reviewCount: 84, bin: 'B-04-02', weightKg: 0.15 },
  CO004: { stock: 42, pv: 36, batch: 'CO0926', hsn: '330410', rating: 4.8, reviewCount: 142, bin: 'C-01-02', weightKg: 0.05 },
  GR005: { stock: 215, pv: 18, batch: 'GR1026', hsn: '100630', rating: 4.9, reviewCount: 211, bin: 'D-03-01', weightKg: 1.05 },
  PC006: { stock: 8, pv: 32, batch: 'PC0926', hsn: '330499', rating: 4.5, reviewCount: 73, bin: 'B-04-03', weightKg: 0.25 },
}

// Deterministic pseudo-random numbers so the catalogue is identical on every load.
function createRandom(seed) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const kebab = (text) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const DESIGN_ORDER = [
  { category: 'haldi', name: 'Lakadong Haldi Powder', unit: '200 g', code: 'HL001' },
  { category: 'shampoo', name: 'Botanical Repair Shampoo', unit: '250 ml', code: 'SH002' },
  { category: 'personal-care', name: 'Gentle Aloe Face Wash', unit: '100 ml', code: 'PC003' },
  { category: 'cosmetics', name: 'Everyday Rose Lip Tint', unit: '4 g', code: 'CO004' },
  { category: 'grocery', name: 'Wholegrain Basmati Rice', unit: '1 kg', code: 'GR005' },
  { category: 'personal-care', name: 'Coconut Nourish Body Lotion', unit: '200 ml', code: 'PC006' },
]

function expandRows() {
  const rows = []
  HALDI.forEach(([name, unit, mrp, sellingPrice], index) => {
    rows.push({ category: 'haldi', name, unit, mrp, sellingPrice, baseIndex: index, sizeIndex: 0, family: 'haldi' })
  })
  const pairs = (category, list) =>
    list.forEach(([name, unitA, mrpA, unitB, mrpB, discount, extra], baseIndex) => {
      const family = CATEGORY_META[category].family
      const resolvedFamily = category === 'personal-care' ? extra : family[0]
      ;[
        [unitA, mrpA],
        [unitB, mrpB],
      ].forEach(([unit, mrp], sizeIndex) => {
        const price = category === 'personal-care' || category === 'shampoo' || category === 'cosmetics' || category === 'grocery' ? roundToFive((mrp * (100 - discount)) / 100) : mrp
        rows.push({
          category,
          name,
          unit,
          mrp,
          sellingPrice: price,
          baseIndex,
          sizeIndex,
          family: resolvedFamily,
          hsn: category === 'grocery' ? extra : undefined,
        })
      })
    })
  pairs('shampoo', SHAMPOO)
  pairs('cosmetics', COSMETICS)
  pairs('grocery', GROCERY)
  pairs('personal-care', PERSONAL_CARE)
  return rows
}

const BLURBS = {
  haldi: 'Naturally vibrant and aromatic, sourced from trusted growers. No added colour. No fillers.',
  shampoo: 'A gentle, plant-based formula that cleanses without stripping, for hair that feels soft and looks healthy.',
  cosmetics: 'A comfortable, buildable formula designed for everyday wear, with colours that suit most skin tones.',
  grocery: 'Honest ingredients, carefully sourced and packed fresh. Everyday nourishment for your kitchen.',
  'personal-care': 'Thoughtfully formulated for daily rituals, kind to skin and free from harsh additives.',
}

const INGREDIENTS = {
  haldi: '100% natural, no additives',
  shampoo: 'Aqua, plant-derived cleansers, botanical extracts, glycerin',
  cosmetics: 'Plant waxes, natural pigments, vitamin E, jojoba oil',
  grocery: '100% natural, no preservatives',
  'personal-care': 'Aqua, aloe vera, plant oils, glycerin',
}

const STORAGE = {
  haldi: 'Cool, dry place',
  shampoo: 'Store below 30°C, away from direct sunlight',
  cosmetics: 'Store in a cool place, close the cap tightly',
  grocery: 'Cool, dry place. Keep sealed after use',
  'personal-care': 'Store below 30°C, away from direct sunlight',
}

/** Builds the catalogue source rows (image *keys*, not URLs). */
export function buildCatalogData() {
  const random = createRandom(2610)
  const rows = expandRows()

  // Order: six design products first (codes fixed), then the rest in category order.
  const isDesignRow = (row) => DESIGN_ORDER.some((d) => d.name === row.name && d.unit === row.unit && d.category === row.category)
  const designRows = DESIGN_ORDER.map((d) => rows.find((row) => row.name === d.name && row.unit === d.unit && row.category === row.category))
  const rest = rows.filter((row) => !isDesignRow(row))
  const ordered = [...designRows, ...rest]

  // Overrides by position in the final list (design products 0–5 are never touched).
  const LOW_STOCK = new Set([33, 47, 58, 77, 90, 104])
  const OUT_OF_STOCK = new Set([20, 66, 85, 111])
  const INACTIVE = new Set([14, 28, 49, 63, 79, 95, 109, 121])

  const counters = {}
  const products = ordered.map((row, index) => {
    const meta = CATEGORY_META[row.category]
    const design = index < 6 ? DESIGN_ORDER[index] : null
    const sequence = index + 1
    const code = design ? design.code : `${meta.prefix}${String(sequence).padStart(3, '0')}`
    counters[row.category] = (counters[row.category] ?? 0) + 1

    const familyKey = row.family
    const family = IMAGE_FAMILIES[familyKey]
    const alt = (row.baseIndex + row.sizeIndex) % 2 === 1
    const facts = DESIGN[code]

    let stock = facts ? facts.stock : Math.round(30 + random() * 220)
    if (LOW_STOCK.has(index)) stock = 2 + Math.floor(random() * 8)
    if (OUT_OF_STOCK.has(index)) stock = 0
    if (row.name === 'Rose Water Toner' && row.sizeIndex === 0) stock = 5

    const discountPercent = Math.round(((row.mrp - row.sellingPrice) / row.mrp) * 100)
    const status = INACTIVE.has(index) ? 'inactive' : 'active'
    const slugBase = kebab(row.name)

    return {
      code,
      id: code,
      slug: row.sizeIndex === 0 && row.baseIndex !== undefined && !(row.category === 'haldi' && row.name === 'Lakadong Haldi Powder' && row.unit !== '200 g') ? slugBase : `${slugBase}-${kebab(row.unit)}`,
      group: slugBase,
      name: row.name,
      unit: row.unit,
      category: row.category,
      categoryLabel: meta.name,
      mrp: row.mrp,
      sellingPrice: row.sellingPrice,
      discountPercent,
      gstPercent: meta.gst,
      hsn: facts?.hsn ?? row.hsn ?? meta.hsn,
      batch: facts?.batch ?? `${meta.prefix}${String(1 + (index % 12)).padStart(2, '0')}26`,
      stock,
      lowStockThreshold: 10,
      pv: facts?.pv ?? Math.max(6, Math.round(row.sellingPrice / 10 / 2) * 2),
      status,
      rating: facts?.rating ?? Math.round((3.9 + random() * 1) * 10) / 10,
      reviewCount: facts?.reviewCount ?? Math.round(8 + random() * 230),
      weightKg: facts?.weightKg ?? 0.2,
      bin: facts?.bin ?? `${'ABCD'[index % 4]}-0${1 + (index % 4)}-0${1 + (index % 3)}`,
      imageKey: alt ? family.cardAlt : family.card,
      thumbnailKey: alt ? family.squareAlt : family.square,
      galleryKeys: [alt ? family.cardAlt : family.card, alt ? family.square : family.squareAlt, ...family.extra],
      tagline:
        code === 'HL001'
          ? 'Pure turmeric · Meghalaya origin · 200 g'
          : `${row.name.replace(/ (Shampoo|Powder|Rice)$/, '')} · ${row.unit}`,
      description:
        code === 'HL001'
          ? 'A pinch of pure goodness. Naturally vibrant, aromatic haldi sourced from the hills of Meghalaya. No added colour. No fillers.'
          : BLURBS[row.category],
      badge: code === 'HL001' ? 'Pantry favourite' : code === 'SH002' ? 'Bestseller' : null,
      ingredients: code === 'HL001' ? '100% Lakadong turmeric' : INGREDIENTS[row.category],
      storage: STORAGE[row.category],
      packedBy: 'Shipper Naturals, Lucknow, Uttar Pradesh',
      bestBefore: 'Sep 2027',
      walletRewards: index % 5 === 0,
      updatedAt: '2026-10-26T10:32:00+05:30',
      updatedBy: 'Pawan Yadav',
    }
  })

  return products
}

export const CATEGORY_ORDER = ['haldi', 'shampoo', 'cosmetics', 'grocery', 'personal-care']
