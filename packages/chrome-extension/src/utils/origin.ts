export function isSupportedUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://')
}

export function getOrigin(url: string): string {
  return new URL(url).origin
}

export function getOriginPattern(origin: string): string {
  const { protocol, hostname } = new URL(origin)
  return `${protocol}//${hostname}/*`
}

export function isLocalOrigin(origin: string): boolean {
  const { hostname } = new URL(origin)
  return hostname === 'localhost' || hostname === '127.0.0.1'
}
