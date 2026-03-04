export type OutputDetail = 'standard' | 'forensic'
export type ToolbarAnchor = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export type InteractionMode
  = | 'idle'
    | 'inspect'
    | 'multi-selecting'
    | 'area-selecting'
    | 'input-open'

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface ElementRef {
  element: string
  elementPath: string
  cssClasses?: string
  boundingBox?: BoundingBox
  vueComponents?: string
}

export interface Annotation {
  id: string
  x: number
  y: number
  comment: string
  element: string
  elementPath: string
  timestamp: number
  _targetRef?: WeakRef<Element>

  url?: string
  selectedText?: string
  boundingBox?: BoundingBox
  nearbyText?: string
  cssClasses?: string
  nearbyElements?: string
  computedStyles?: string
  fullPath?: string
  accessibility?: string
  isFixed?: boolean
  vueComponents?: string

  isMultiSelect?: boolean
  elements?: ElementRef[]

  isAreaSelect?: boolean
  area?: BoundingBox
}

export interface AgentationProps {
  outputDetail?: OutputDetail
  markerColor?: string
  copyToClipboard?: boolean
  blockPageInteractions?: boolean
  autoHideToolbar?: boolean
  pageUrl?: string
  demoAnnotations?: Annotation[]
  theme?: 'light' | 'dark' | 'auto'
  activationKey?: 'none' | 'Meta' | 'Alt' | 'Shift'
}

export interface AgentationEmits {
  'annotation-add': [annotation: Annotation]
  'annotation-delete': [annotation: Annotation]
  'annotation-update': [annotation: Annotation]
  'annotations-clear': [annotations: Annotation[]]
  'copy': [markdown: string]
}

export interface Settings {
  outputDetail: OutputDetail
  markerColor: string
  blockPageInteractions: boolean
  autoHideToolbar: boolean
  toolbarPlacement: ToolbarAnchor
  clearAfterCopy: boolean
  showComponentTree: boolean
  theme: 'light' | 'dark' | 'auto'
  activationKey: 'none' | 'Meta' | 'Alt' | 'Shift'
}
