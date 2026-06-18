const CITY_PREFIX = /^г\.?\s*/i

const KNOWN_CITIES = [
  'Санкт-Петербург',
  'Нижний Новгород',
  'Ростов-на-Дону',
  'Екатеринбург',
  'Новосибирск',
  'Красноярск',
  'Владивосток',
  'Хабаровск',
  'Москва',
  'Казань',
  'Челябинск',
  'Самара',
  'Омск',
  'Уфа',
  'Пермь',
  'Волгоград',
  'Краснодар',
  'Тюмень',
  'Воронеж',
]

function titleCity(raw: string): string {
  const s = raw.trim().replace(CITY_PREFIX, '')
  if (!s) return ''
  return s.split(/(\s|-)/).map((part) => {
    if (part === ' ' || part === '-') return part
    if (part.length <= 3 && part.endsWith('.')) return part
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  }).join('')
}

/** Extract city/locality from a full Russian address (without street and house). */
export function parseCityFromAddress(address: string): string {
  const q = address.trim()
  if (!q) return ''

  for (const city of KNOWN_CITIES) {
    if (q.toLowerCase().includes(city.toLowerCase())) return city
  }

  const parts = q.split(',').map((p) => p.trim()).filter(Boolean)
  if (!parts.length) return ''

  const first = parts[0]
  if (/^(г\.?|город\s)/i.test(first) || /^[А-ЯA-ZЁ][а-яa-zё-]+(\s[А-ЯA-ZЁ][а-яa-zё-]+)*$/.test(first.replace(CITY_PREFIX, ''))) {
    const city = titleCity(first)
    if (city && !/^(ул\.?|улица|пр\.?|проспект|пер\.?|переулок|ш\.?|шоссе|б-?р|бульвар|наб\.?|набережная|тракт|мкр\.?|микрорайон)/i.test(city)) {
      return city
    }
  }

  for (const part of parts) {
    if (/^(ул\.?|улица|пр\.?|проспект|пер\.?|переулок|ш\.?|шоссе|б-?р|бульвар|наб\.?|набережная|д\.?|дом|\d)/i.test(part)) continue
    if (/^(г\.?|город\s)/i.test(part)) return titleCity(part)
    if (/^[А-ЯA-ZЁ]/.test(part) && !/\d/.test(part)) return titleCity(part)
  }

  return titleCity(first)
}
