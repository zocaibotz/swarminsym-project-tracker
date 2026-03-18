import test from 'node:test';
import assert from 'node:assert/strict';
import { createShortcutManager } from '../src/navigation/shortcutManager.js';

test('keyboard shortcuts trigger search, settings and project switcher', () => {
  const events = [];
  const manager = createShortcutManager({
    onSearch: () => events.push('search'),
    onSettings: () => events.push('settings'),
    onProjectSwitcher: () => events.push('projectSwitcher')
  });

  manager.handle({ key: 'k', ctrlKey: true, metaKey: false });
  manager.handle({ key: ',', ctrlKey: true, metaKey: false });
  manager.handle({ key: 'p', ctrlKey: true, metaKey: false });

  assert.deepEqual(events, ['search', 'settings', 'projectSwitcher']);
});
