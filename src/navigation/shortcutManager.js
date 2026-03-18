const normalizeKey = (key = '') => key.toLowerCase();

export function createShortcutManager(handlers) {
  return {
    handle(event) {
      const key = normalizeKey(event.key);
      const command = Boolean(event.ctrlKey || event.metaKey);

      if (!command) return false;
      if (key === 'k') {
        handlers.onSearch?.();
        return true;
      }
      if (key === ',') {
        handlers.onSettings?.();
        return true;
      }
      if (key === 'p') {
        handlers.onProjectSwitcher?.();
        return true;
      }
      return false;
    }
  };
}
