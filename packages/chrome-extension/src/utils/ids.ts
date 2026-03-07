export function getOriginRegistrationIds(origin: string) {
  const safeOrigin = origin.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase()
  return {
    content: `agentation-content-${safeOrigin}`,
    mainWorld: `agentation-main-world-${safeOrigin}`,
  }
}
