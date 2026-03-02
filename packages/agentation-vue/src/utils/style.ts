import type { BoundingBox } from '../types'

export function boundingBoxToStyle(rect: BoundingBox): Record<string, string> {
  return {
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  }
}
