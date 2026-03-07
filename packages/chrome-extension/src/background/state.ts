const STATE_KEY = 'agentation-extension-state'

export interface ExtensionState {
  enabledOrigins: string[]
}

const DEFAULT_STATE: ExtensionState = {
  enabledOrigins: [],
}

export async function getExtensionState(): Promise<ExtensionState> {
  const stored = await chrome.storage.local.get(STATE_KEY)
  const state = stored[STATE_KEY] as ExtensionState | undefined
  if (!state || !Array.isArray(state.enabledOrigins))
    return { ...DEFAULT_STATE }
  return {
    enabledOrigins: [...new Set(state.enabledOrigins)],
  }
}

export async function setExtensionState(state: ExtensionState) {
  await chrome.storage.local.set({ [STATE_KEY]: state })
}

export async function addEnabledOrigin(origin: string) {
  const state = await getExtensionState()
  if (!state.enabledOrigins.includes(origin)) {
    state.enabledOrigins.push(origin)
    await setExtensionState(state)
  }
}

export async function removeEnabledOrigin(origin: string) {
  const state = await getExtensionState()
  const nextOrigins = state.enabledOrigins.filter(item => item !== origin)
  await setExtensionState({ enabledOrigins: nextOrigins })
}
