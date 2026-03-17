export const storageService = {
  get: <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  set: <T>(key: string, data: T[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  },

  add: <T extends { id: string }>(key: string, item: T): T => {
    const items = storageService.get<T>(key);
    items.push(item);
    storageService.set(key, items);
    return item;
  },

  update: <T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null => {
    const items = storageService.get<T>(key);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    storageService.set(key, items);
    return items[index];
  },

  delete: (key: string, id: string): boolean => {
    const items = storageService.get<{ id: string }>(key);
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    
    storageService.set(key, filtered);
    return true;
  },

  findOne: <T extends { id: string }>(key: string, id: string): T | null => {
    const items = storageService.get<T>(key);
    return items.find(item => item.id === id) || null;
  },

  findWhere: <T>(key: string, predicate: (item: T) => boolean): T[] => {
    const items = storageService.get<T>(key);
    return items.filter(predicate);
  }
};
