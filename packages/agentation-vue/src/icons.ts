export const icons = {
  'cursor': '<path d="m4 4 7 17 2.5-7.5L21 11Z"/>',
  'area-select': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18" opacity="0.3"/>',
  'pause': '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  'play': '<polygon points="5,3 19,12 5,21"/>',
  'copy': '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
  'trash': '<path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>',
  'settings': '<path d="M14.4 2h-4.8l-.6 3a7.8 7.8 0 0 0-1.9 1.1L4.3 5 2 9.1l2.2 2a7.7 7.7 0 0 0 0 1.8L2 14.9 4.3 19l2.8-1.1A7.8 7.8 0 0 0 9 19l.6 3h4.8l.6-3a7.8 7.8 0 0 0 1.9-1.1l2.8 1.1 2.3-4.1-2.2-2a7.7 7.7 0 0 0 0-1.8l2.2-2L19.7 5l-2.8 1.1A7.8 7.8 0 0 0 15 5z"/><circle cx="12" cy="12" r="3"/>',
  'minimize': '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  'moon': '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
  'pencil': '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  'plus': '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  'close': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
} as const

export type IconName = keyof typeof icons
