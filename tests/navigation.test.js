import test from 'node:test';
import assert from 'node:assert/strict';
import { SidebarController } from '../src/navigation/sidebarController.js';
import { ThemeManager } from '../src/theme/themeManager.js';
import { MemoryPreferencesStore } from '../src/preferences/memoryPreferencesStore.js';

test('sidebar supports keyboard navigation and mobile collapse', () => {
  const store = new MemoryPreferencesStore();
  const sidebar = new SidebarController({ preferencesStore: store, mobileWidth: 768 });

  sidebar.setViewportWidth(390);
  assert.equal(sidebar.isCollapsed(), true);

  sidebar.toggleCollapsed();
  assert.equal(sidebar.isCollapsed(), false);

  sidebar.focusNext();
  sidebar.focusNext();
  assert.equal(sidebar.getFocusedItem().id, 'search');
});

test('recent projects are persisted and de-duplicated', () => {
  const store = new MemoryPreferencesStore();
  const sidebar = new SidebarController({ preferencesStore: store });

  sidebar.switchProject('project-1');
  sidebar.switchProject('project-2');
  sidebar.switchProject('project-1');

  assert.deepEqual(sidebar.getRecentProjects(), ['project-1', 'project-2']);
});

test('theme manager toggles dark/light mode', () => {
  const store = new MemoryPreferencesStore();
  const theme = new ThemeManager(store);

  assert.equal(theme.getTheme(), 'light');
  theme.toggleTheme();
  assert.equal(theme.getTheme(), 'dark');
  theme.toggleTheme();
  assert.equal(theme.getTheme(), 'light');
});
