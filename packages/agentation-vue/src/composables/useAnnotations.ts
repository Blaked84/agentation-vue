import type { Annotation } from '../types'
import { ref } from 'vue-demi'

const STORAGE_KEY = 'agentation-vue-annotations'
type AnnotationStore = Record<string, Annotation[]>

function serializeAnnotations(annotations: Annotation[]): string {
  return JSON.stringify(annotations.map(({ _targetRef, ...rest }) => rest))
}

function getCurrentUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : ''
}

function parseStore(raw: string | null, currentUrl: string): AnnotationStore {
  if (!raw)
    return {}

  try {
    const parsed: unknown = JSON.parse(raw)

    // Backward compatibility with previous array-only storage shape.
    if (Array.isArray(parsed))
      return { [currentUrl]: parsed as Annotation[] }

    if (!parsed || typeof parsed !== 'object')
      return {}

    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, value]) => Array.isArray(value)),
    ) as AnnotationStore
  }
  catch {}
  return {}
}

function loadAnnotations(url: string): Annotation[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    const store = parseStore(stored, url)
    const annotations = store[url]
    return Array.isArray(annotations) ? annotations : []
  }
  catch {}
  return []
}

function getCounterSeed(annotations: Annotation[]): number {
  return annotations.reduce((max, annotation) => {
    const parsed = Number.parseInt(annotation.id, 10)
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max
  }, 0)
}

const annotations = ref<Annotation[]>([])
let scopedUrl = getCurrentUrl()
let counter = 0

function setScopeUrl(url: string) {
  scopedUrl = url || getCurrentUrl()
  annotations.value = loadAnnotations(scopedUrl)
  counter = getCounterSeed(annotations.value)
}

function save() {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    const store = parseStore(stored, scopedUrl)

    if (annotations.value.length > 0)
      store[scopedUrl] = annotations.value
    else
      delete store[scopedUrl]

    const serialized = JSON.stringify(
      Object.fromEntries(
        Object.entries(store).map(([url, scopedAnnotations]) => [
          url,
          JSON.parse(serializeAnnotations(scopedAnnotations)),
        ]),
      ),
    )
    sessionStorage.setItem(STORAGE_KEY, serialized)
  }
  catch {}
}

function addAnnotation(annotation: Omit<Annotation, 'id' | 'timestamp'>): Annotation {
  counter++
  const full: Annotation = {
    ...annotation,
    url: annotation.url || scopedUrl,
    id: String(counter),
    timestamp: Date.now(),
  }
  annotations.value.push(full)
  save()
  return full
}

function removeAnnotation(id: string): Annotation | undefined {
  const index = annotations.value.findIndex(a => a.id === id)
  if (index === -1)
    return undefined
  const [removed] = annotations.value.splice(index, 1)
  save()
  return removed
}

function updateAnnotation(id: string, updates: Partial<Annotation>): Annotation | undefined {
  const ann = annotations.value.find(a => a.id === id)
  if (!ann)
    return undefined
  Object.assign(ann, updates)
  save()
  return ann
}

function clearAnnotations(): Annotation[] {
  const cleared = [...annotations.value]
  annotations.value.splice(0)
  counter = 0
  save()
  return cleared
}

setScopeUrl(scopedUrl)

export function useAnnotations(initialUrl: string = getCurrentUrl()) {
  setScopeUrl(initialUrl)
  return { annotations, addAnnotation, removeAnnotation, updateAnnotation, clearAnnotations, setScopeUrl }
}
