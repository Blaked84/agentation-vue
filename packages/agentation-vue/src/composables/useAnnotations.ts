import type { Annotation } from '../types'
import { ref } from 'vue-demi'

const STORAGE_KEY = 'agentation-vue-annotations'

function serializeAnnotations(annotations: Annotation[]): string {
  return JSON.stringify(annotations.map(({ _targetRef, ...rest }) => rest))
}

function loadAnnotations(): Annotation[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored)
      return JSON.parse(stored)
  }
  catch {}
  return []
}

export function useAnnotations() {
  const annotations = ref<Annotation[]>(loadAnnotations())
  let counter = annotations.value.length

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, serializeAnnotations(annotations.value))
    }
    catch {}
  }

  function addAnnotation(annotation: Omit<Annotation, 'id' | 'timestamp'>): Annotation {
    counter++
    const full: Annotation = {
      ...annotation,
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

  return { annotations, addAnnotation, removeAnnotation, updateAnnotation, clearAnnotations }
}
