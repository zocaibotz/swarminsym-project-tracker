export class ThemeManager {
  constructor(preferencesStore) {
    this.preferencesStore = preferencesStore;
  }

  getTheme() {
    return this.preferencesStore.get('theme', 'light');
  }

  setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      throw new Error('Unsupported theme');
    }
    this.preferencesStore.set('theme', theme);
    return theme;
  }

  toggleTheme() {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    return this.setTheme(next);
  }
}
