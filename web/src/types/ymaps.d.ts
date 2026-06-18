declare global {
  interface Window {
    ymaps?: {
      ready: (cb: () => void) => void
      Map: new (
        element: HTMLElement,
        state: { center: number[]; zoom: number; controls?: string[] },
        options?: Record<string, unknown>,
      ) => YMap
      geocode: (query: string | number[], options?: { results?: number }) => Promise<YGeocodeResult>
    }
  }
}

interface YMap {
  geoObjects: { add: (obj: unknown) => void; remove: (obj: unknown) => void }
  container: { fitToViewport: () => void }
  setCenter: (center: number[], zoom?: number, options?: Record<string, unknown>) => void
  getCenter: () => number[]
  getZoom: () => number
  setType: (type: string) => void
  destroy: () => void
  behaviors: {
    enable: (behavior: string) => void
    disable: (behavior: string) => void
  }
  events: {
    add: (event: string, handler: (e: { get: (key: string) => number[] }) => void) => void
    remove: (event: string, handler: () => void) => void
  }
}

interface YGeocodeResult {
  geoObjects: {
    get: (index: number) => {
      geometry: { getCoordinates: () => number[] }
      getAddressLine: () => string
    } | null
  }
}

export {}
