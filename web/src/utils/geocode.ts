export interface GeocodeResult {
  address: string
  label?: string
  lat: number
  lon: number
}

const base = import.meta.env.VITE_API_URL ?? ''

async function geocodeViaYmaps(query: string): Promise<GeocodeResult | null> {
  if (!window.ymaps) return null
  try {
    await new Promise<void>((resolve) => window.ymaps!.ready(resolve))
    const yres = await window.ymaps!.geocode(query, { results: 1 })
    const first = yres.geoObjects.get(0)
    if (!first) return null
    const coords = first.geometry.getCoordinates()
    return {
      address: query,
      label: first.getAddressLine() || query,
      lat: coords[0],
      lon: coords[1],
    }
  } catch {
    return null
  }
}

export async function geocodeAddress(query: string, cityHint = ''): Promise<GeocodeResult> {
  const q = query.trim()
  if (!q) throw new Error('Укажите адрес')

  const ymapsResult = await geocodeViaYmaps(q)
  if (ymapsResult) return ymapsResult

  const params = new URLSearchParams({ q })
  if (cityHint.trim()) params.set('city', cityHint.trim())

  const res = await fetch(`${base}/api/v1/geocode?${params}`)
  if (res.ok) {
    const data = await res.json() as GeocodeResult
    return { ...data, address: data.address || q }
  }

  throw new Error('Адрес не найден. Уточните запрос или выберите точку на карте.')
}
