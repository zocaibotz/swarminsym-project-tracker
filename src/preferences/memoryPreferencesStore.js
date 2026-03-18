export class MemoryPreferencesStore {
  constructor(initial = {}) {
    this.state = {
      theme: 'light',
      recentProjects: [],
      ...initial
    };
  }

  get(key, fallback = undefined) {
    return this.state[key] ?? fallback;
  }

  set(key, value) {
    this.state[key] = value;
    return value;
  }
}
