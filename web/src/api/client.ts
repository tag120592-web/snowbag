import type {
  CalculationData,
  CalculationHistory,
  CalculationRunSnapshot,
  CreateProjectPayload,
  GeometryData,
  Project,
  ProjectListItem,
} from '@/types'

const base = import.meta.env.VITE_API_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'request failed')
  }
  return res.json()
}

export function listProjects() {
  return request<ProjectListItem[]>('/api/v1/projects')
}

export function getProject(id: string) {
  return request<Project>(`/api/v1/projects/${id}`)
}

export function createProject(payload: CreateProjectPayload) {
  return request<Project>('/api/v1/projects', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateProject(id: string, body: Record<string, unknown>) {
  return request<Project>(`/api/v1/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export async function deleteProject(id: string) {
  const res = await fetch(`${base}/api/v1/projects/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'delete failed')
  }
}

export function lookupClimate(
  city: string,
  snowRegion?: string,
  windRegion?: string,
  coords?: { lat: number; lon: number },
) {
  const params = new URLSearchParams({ city })
  if (snowRegion) params.set('snowRegion', snowRegion)
  if (windRegion) params.set('windRegion', windRegion)
  if (coords && !snowRegion && !windRegion) {
    params.set('lat', String(coords.lat))
    params.set('lon', String(coords.lon))
  }
  return request<ClimateLookupResult>(`/api/v1/climate?${params}`)
}

export interface ClimateLookupResult {
  norm: string
  month: string
  monthLabel: string
  matchedCity?: string
  matchQuality?: string
  regionSource?: string
  snowRegion: string
  windRegion: string
  sg: number
  w0: number
  windRose: CalculationData['windRose']
  prevailingWind?: { dir: string; deg: number; v: number }
  prevailingLabel?: string
}

export function calculateProject(id: string, body: Record<string, unknown> = {}) {
  return request<{ project: Project; calculation: CalculationData }>(`/api/v1/projects/${id}/calculate`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function listCalculations(projectId: string) {
  return request<CalculationHistory>(`/api/v1/projects/${projectId}/calculations`)
}

export function getCalculationRun(projectId: string, runId: string) {
  return request<CalculationRunSnapshot>(`/api/v1/projects/${projectId}/calculations/${runId}`)
}

export function recalculateProject(projectId: string) {
  return request<{ project: Project; calculation: CalculationData; history: CalculationHistory }>(
    `/api/v1/projects/${projectId}/recalculate`,
    { method: 'POST' },
  )
}

export async function uploadProjectFile(projectId: string, file: File) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch(`${base}/api/v1/projects/${projectId}/files`, { method: 'POST', body: fd })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'upload failed')
  }
  return res.json() as Promise<{ id: string; url: string; name: string }>
}

export function exportProject(id: string, format: 'json' | 'pdf' | 'excel' = 'json') {
  return fetch(`${base}/api/v1/projects/${id}/export?format=${format}`)
}

export async function downloadExport(id: string, format: 'json' | 'pdf' | 'excel') {
  const res = await exportProject(id, format)
  if (!res.ok) throw new Error('export failed')
  const blob = await res.blob()
  const ext = format === 'excel' ? 'xlsx' : format
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `project-${id}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

export function healthCheck() {
  return request<{ status: string }>('/health')
}

export function getPublicConfig() {
  return request<{ yandexMapsApiKey?: string }>('/api/v1/config')
}

export function geocodeAddressApi(query: string, city?: string) {
  const params = new URLSearchParams({ q: query })
  if (city?.trim()) params.set('city', city.trim())
  return request<{ address: string; label?: string; lat: number; lon: number }>(`/api/v1/geocode?${params}`)
}

export function projectUnderlayUrl(projectId: string) {
  const base = import.meta.env.VITE_API_URL ?? ''
  return `${base}/api/v1/projects/${projectId}/underlay`
}
