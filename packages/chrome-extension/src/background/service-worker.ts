import { BADGE_UPDATE_MESSAGE, PING_MESSAGE, UNMOUNT_MESSAGE } from '../shared/messages'
import { getOrigin, getOriginPattern, isLocalOrigin, isSupportedUrl } from '../utils/origin'
import { ensureScriptsInjected, registerOriginScripts, unregisterOriginScripts } from './registrations'
import { addEnabledOrigin, getExtensionState, removeEnabledOrigin, setExtensionState } from './state'

declare global {
  // eslint-disable-next-line vars-on-top
  var __agentationTestApi: {
    enableActiveTab: () => Promise<boolean>
    disableActiveTab: () => Promise<boolean>
    toggleActiveTab: () => Promise<boolean>
    enableTabByUrl: (url: string) => Promise<boolean>
    disableTabByUrl: (url: string) => Promise<boolean>
    getEnabledOrigins: () => Promise<string[]>
    clearAnnotationStorage: () => Promise<void>
  } | undefined
}

async function ensureSessionAccessLevel() {
  if ('session' in chrome.storage && 'setAccessLevel' in chrome.storage.session) {
    await chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' })
  }
}

async function setBadge(tabId: number, count: number) {
  await chrome.action.setBadgeBackgroundColor({ color: '#42B883', tabId })
  await chrome.action.setBadgeText({ text: count > 0 ? String(count) : '', tabId })
}

async function clearBadge(tabId: number) {
  await chrome.action.setBadgeText({ text: '', tabId })
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  return tab
}

async function getTabByUrl(url: string) {
  const tabs = await chrome.tabs.query({})
  return tabs.find(tab => tab.url === url)
}

async function hasHostPermission(origin: string): Promise<boolean> {
  return chrome.permissions.contains({ origins: [getOriginPattern(origin)] })
}

async function requestHostPermission(origin: string): Promise<boolean> {
  if (isLocalOrigin(origin))
    return true

  try {
    return await chrome.permissions.request({ origins: [getOriginPattern(origin)] })
  }
  catch {
    return false
  }
}

async function enableOriginForTab(tab: chrome.tabs.Tab): Promise<boolean> {
  if (!tab.id || !tab.url || !isSupportedUrl(tab.url))
    return false

  await ensureSessionAccessLevel()

  const origin = getOrigin(tab.url)
  const hasPermission = await hasHostPermission(origin)
  if (!hasPermission) {
    const granted = await requestHostPermission(origin)
    if (!granted)
      return false
  }

  await registerOriginScripts(origin)
  await addEnabledOrigin(origin)
  await ensureScriptsInjected(tab.id)
  void chrome.tabs.sendMessage(tab.id, { type: PING_MESSAGE }).catch(() => undefined)
  return true
}

async function disableOriginForTab(tab: chrome.tabs.Tab): Promise<boolean> {
  if (!tab.id || !tab.url || !isSupportedUrl(tab.url))
    return false

  const origin = getOrigin(tab.url)
  await unregisterOriginScripts(origin)
  await removeEnabledOrigin(origin)
  void chrome.tabs.sendMessage(tab.id, { type: UNMOUNT_MESSAGE }).catch(() => undefined)
  await clearBadge(tab.id)
  return true
}

async function toggleOriginForTab(tab: chrome.tabs.Tab): Promise<boolean> {
  if (!tab.url || !isSupportedUrl(tab.url))
    return false

  const origin = getOrigin(tab.url)
  const state = await getExtensionState()
  if (state.enabledOrigins.includes(origin))
    return disableOriginForTab(tab)

  return enableOriginForTab(tab)
}

async function reconcileState() {
  await ensureSessionAccessLevel()

  const state = await getExtensionState()
  const nextOrigins: string[] = []

  for (const origin of state.enabledOrigins) {
    if (await hasHostPermission(origin) || isLocalOrigin(origin)) {
      await registerOriginScripts(origin)
      nextOrigins.push(origin)
    }
    else {
      await unregisterOriginScripts(origin)
    }
  }

  await setExtensionState({ enabledOrigins: nextOrigins })
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureSessionAccessLevel()
  void reconcileState()
})

chrome.runtime.onStartup.addListener(() => {
  void ensureSessionAccessLevel()
  void reconcileState()
})

chrome.action.onClicked.addListener((tab) => {
  void toggleOriginForTab(tab)
})

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || typeof message !== 'object')
    return undefined

  if (message.type === BADGE_UPDATE_MESSAGE && sender.tab?.id) {
    void setBadge(sender.tab.id, message.count)
    return undefined
  }

  return undefined
})

globalThis.__agentationTestApi = {
  async enableActiveTab() {
    const tab = await getActiveTab()
    if (!tab)
      return false
    return enableOriginForTab(tab)
  },
  async disableActiveTab() {
    const tab = await getActiveTab()
    if (!tab)
      return false
    return disableOriginForTab(tab)
  },
  async toggleActiveTab() {
    const tab = await getActiveTab()
    if (!tab)
      return false
    return toggleOriginForTab(tab)
  },
  async getEnabledOrigins() {
    const state = await getExtensionState()
    return state.enabledOrigins
  },
  async enableTabByUrl(url: string) {
    const tab = await getTabByUrl(url)
    if (!tab)
      return false
    return enableOriginForTab(tab)
  },
  async disableTabByUrl(url: string) {
    const tab = await getTabByUrl(url)
    if (!tab)
      return false
    return disableOriginForTab(tab)
  },
  async clearAnnotationStorage() {
    await chrome.storage.session.remove('agentation-vue-annotations')
  },
}

void ensureSessionAccessLevel()
void reconcileState()
