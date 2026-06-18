export function inferUnderlayMime(filename: string, mime?: string): string {
  if (mime && mime !== 'application/octet-stream') return mime
  const lower = filename.toLowerCase()
  if (lower.endsWith('.pdf')) return 'application/pdf'
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.dwg')) return 'image/vnd.dwg'
  if (lower.endsWith('.dxf')) return 'image/vnd.dxf'
  return mime ?? ''
}

export function isPdfMime(mime?: string) {
  return mime === 'application/pdf'
}

export function isDwgMime(mime?: string) {
  return !!mime && (mime.includes('dwg') || mime.includes('dxf') || mime === 'application/acad')
}
