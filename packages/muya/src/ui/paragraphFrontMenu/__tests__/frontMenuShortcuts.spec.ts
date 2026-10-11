import { afterEach, describe, expect, it, vi } from 'vitest';

// `isOsx` and `isWin` are read once when the config module loads, so every
// platform gets a fresh import of the menu config.
async function loadShortcuts(platform: { isOsx: boolean; isWin: boolean }) {
    vi.resetModules();
    vi.doMock('../../../config', async importOriginal => ({
        ...(await importOriginal<typeof import('../../../config')>()),
        ...platform,
    }));
    const { FRONT_MENU } = await import('../config');

    return Object.fromEntries(FRONT_MENU.map(item => [item.label, item.shortCut]));
}

afterEach(() => {
    vi.doUnmock('../../../config');
});

describe('paragraph front menu shortcut hints', () => {
    it('match the macOS key bindings', async () => {
        expect(await loadShortcuts({ isOsx: true, isWin: false })).toEqual({
            duplicate: '⌥⌘D',
            new: '⇧⌘N',
            delete: '⇧⌘D',
        });
    });

    it('match the Windows key bindings', async () => {
        expect(await loadShortcuts({ isOsx: false, isWin: true })).toEqual({
            duplicate: '⌥⌃D',
            new: '⇧⌃N',
            delete: '⇧⌃D',
        });
    });

    it('match the Linux key bindings', async () => {
        expect(await loadShortcuts({ isOsx: false, isWin: false })).toEqual({
            duplicate: '⇧⌃E',
            new: '⇧⌃N',
            delete: '⇧⌃D',
        });
    });
});
