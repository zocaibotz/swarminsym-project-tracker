const DEFAULT_ITEMS = [
  { id: 'projects', label: 'Projects' },
  { id: 'search', label: 'Search' },
  { id: 'settings', label: 'Settings' }
];

export class SidebarController {
  constructor({ preferencesStore, mobileWidth = 768, navItems = DEFAULT_ITEMS } = {}) {
    this.preferencesStore = preferencesStore;
    this.mobileWidth = mobileWidth;
    this.navItems = navItems;
    this.focusedIndex = -1;
    this.collapsed = false;
    this.viewportWidth = 1280;
    this.updateMobileState();
  }

  updateMobileState() {
    if (this.viewportWidth <= this.mobileWidth) {
      this.collapsed = true;
    }
  }

  setViewportWidth(width) {
    this.viewportWidth = width;
    this.updateMobileState();
  }

  isCollapsed() {
    return this.collapsed;
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    return this.collapsed;
  }

  focusNext() {
    this.focusedIndex = (this.focusedIndex + 1) % this.navItems.length;
    return this.getFocusedItem();
  }

  focusPrevious() {
    this.focusedIndex = (this.focusedIndex - 1 + this.navItems.length) % this.navItems.length;
    return this.getFocusedItem();
  }

  getFocusedItem() {
    return this.navItems[this.focusedIndex];
  }

  switchProject(projectId) {
    const recents = this.preferencesStore.get('recentProjects', []);
    const next = [projectId, ...recents.filter((id) => id !== projectId)].slice(0, 10);
    this.preferencesStore.set('recentProjects', next);
    return next;
  }

  getRecentProjects() {
    return this.preferencesStore.get('recentProjects', []);
  }
}
