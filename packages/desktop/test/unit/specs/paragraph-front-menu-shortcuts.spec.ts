import { describe, it, expect, vi } from 'vitest'
import keybindingsDarwin from 'main_renderer/keyboard/keybindingsDarwin'
import keybindingsWindows from 'main_renderer/keyboard/keybindingsWindows'
import keybindingsLinux from 'main_renderer/keyboard/keybindingsLinux'

// muya hardcodes the paragraph front menu's shortcut hints, so nothing else
// ties them to these tables (#5155).
const FRONT_MENU_KEYBINDING: Readonly<Record<string, string>> = {
  duplicate: 'edit.duplicate',
  new: 'edit.create-paragraph',
  delete: 'edit.delete-paragraph'
}

const MODIFIER_SYMBOLS: Readonly<Record<string, string>> = {
  command: '⌘',
  ctrl: '⌃',
  option: '⌥',
  alt: '⌥',
  shift: '⇧'
}

// The menu orders modifiers differently from the accelerators, so compare the
// keys as a set.
const acceleratorKeys = (accelerator: string): string[] =>
  accelerator
    .split('+')
    .map((part) => MODIFIER_SYMBOLS[part.toLowerCase()] ?? part)
    .sort()

// muya reads `isOsx` / `isWin` once at module load, so load a fresh copy of the
// menu config for each platform.
const loadFrontMenu = async(platform: { isOsx: boolean; isWin: boolean }) => {
  vi.resetModules()
  vi.doMock('@muyajs/core/config/index.ts', async(importOriginal) => ({
    ...(await importOriginal<object>()),
    ...platform
  }))
  const { FRONT_MENU } = await import('@muyajs/core/ui/paragraphFrontMenu/config')
  vi.doUnmock('@muyajs/core/config/index.ts')
  return FRONT_MENU
}

describe.each([
  ['macOS', { isOsx: true, isWin: false }, keybindingsDarwin],
  ['Windows', { isOsx: false, isWin: true }, keybindingsWindows],
  ['Linux', { isOsx: false, isWin: false }, keybindingsLinux]
])('paragraph front menu shortcut hints on %s', (_platformName, platform, keybindings) => {
  it('match the default key bindings', async() => {
    for (const { label, shortCut } of await loadFrontMenu(platform)) {
      const accelerator = keybindings.get(FRONT_MENU_KEYBINDING[label]) ?? ''
      expect([...shortCut].sort(), label).toEqual(acceleratorKeys(accelerator))
    }
  })
})
