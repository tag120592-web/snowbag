import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

export type PdfDocument = Awaited<ReturnType<typeof loadPdfFromFile>>

export async function loadPdfFromFile(file: File) {
  const data = await file.arrayBuffer()
  return pdfjsLib.getDocument({ data }).promise
}

export async function renderPageToCanvas(
  pdf: PdfDocument,
  pageNum: number,
  canvas: HTMLCanvasElement,
  maxDimension: number,
) {
  const page = await pdf.getPage(pageNum)
  const base = page.getViewport({ scale: 1 })
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1
  const scale = Math.min(maxDimension / base.width, maxDimension / base.height, 4) * dpr
  const viewport = page.getViewport({ scale })
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas unavailable')
  await page.render({ canvasContext: ctx, viewport }).promise
}

export async function renderPageToDataUrl(
  pdf: PdfDocument,
  pageNum: number,
  maxDimension: number,
): Promise<string> {
  const canvas = document.createElement('canvas')
  await renderPageToCanvas(pdf, pageNum, canvas, maxDimension)
  return canvas.toDataURL('image/png')
}

export async function renderPageToBlob(
  pdf: PdfDocument,
  pageNum: number,
  maxDimension = 4000,
): Promise<Blob> {
  const dataUrl = await renderPageToDataUrl(pdf, pageNum, maxDimension)
  const res = await fetch(dataUrl)
  return res.blob()
}

export function pdfPageFileName(originalName: string, page: number): string {
  const base = originalName.replace(/\.pdf$/i, '').trim() || 'чертёж'
  return `${base} · лист ${page}.png`
}

export function parseUnderlayPageFromName(name: string): number | null {
  const m = name.match(/лист\s+(\d+)/i)
  return m ? Number(m[1]) : null
}
