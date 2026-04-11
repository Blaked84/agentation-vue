import { getOriginRegistrationIds } from '../utils/ids'
import { getOriginPattern } from '../utils/origin'

const CONTENT_SCRIPT_FILE = 'content-script.js'
const MAIN_WORLD_FILE = 'main-world.js'

export async function registerOriginScripts(origin: string) {
  const { content, mainWorld } = getOriginRegistrationIds(origin)
  const matches = [getOriginPattern(origin)]

  await unregisterOriginScripts(origin)

  await chrome.scripting.registerContentScripts([
    {
      id: content,
      js: [CONTENT_SCRIPT_FILE],
      matches,
      persistAcrossSessions: true,
      runAt: 'document_idle',
      world: 'ISOLATED',
    },
    {
      id: mainWorld,
      js: [MAIN_WORLD_FILE],
      matches,
      persistAcrossSessions: true,
      runAt: 'document_start',
      world: 'MAIN',
    },
  ])
}

export async function unregisterOriginScripts(origin: string) {
  const { content, mainWorld } = getOriginRegistrationIds(origin)
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [content, mainWorld] })
  }
  catch {}
}

export async function ensureScriptsInjected(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: [MAIN_WORLD_FILE],
    world: 'MAIN',
  })

  await chrome.scripting.executeScript({
    target: { tabId },
    files: [CONTENT_SCRIPT_FILE],
    world: 'ISOLATED',
  })
}
