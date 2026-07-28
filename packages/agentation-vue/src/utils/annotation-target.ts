import type { Annotation } from '../types'
import { isInsideAgentationTree } from './agentation-tree'

function isUsableTarget(target: Element | undefined): target is Element {
  return !!target?.isConnected && !isInsideAgentationTree(target)
}

export function resolveAnnotationTarget(annotation: Annotation): Element | null {
  const existingTarget = annotation._targetRef?.deref()
  if (isUsableTarget(existingTarget))
    return existingTarget

  annotation._targetRef = undefined
  if (typeof document === 'undefined' || !annotation.elementPath)
    return null

  try {
    const target = document.querySelector(annotation.elementPath)
    if (!target || isInsideAgentationTree(target))
      return null

    annotation._targetRef = new WeakRef(target)
    return target
  }
  catch {
    return null
  }
}

export function isForeignAnnotation(annotation: Annotation, currentUrl: string): boolean {
  return !!annotation.url && annotation.url !== currentUrl
}

export function shouldRenderAnnotationMarker(
  annotation: Annotation,
  currentUrl: string,
  hasResolvedTarget: boolean,
): boolean {
  return !isForeignAnnotation(annotation, currentUrl) || hasResolvedTarget
}
