const PREFIX = 'jobx_';
const STORAGE_LIMIT = 50 * 1024 * 1024; // 50MB

function estimateSize(value: unknown): number {
  try {
    return JSON.stringify(value).length;
  } catch {
    return 0;
  }
}

function estimateCurrentUsage(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k) {
      const v = localStorage.getItem(k);
      if (v) total += v.length;
    }
  }
  return total;
}

function estimateRemainingQuota(): number {
  const used = estimateCurrentUsage();
  return Math.max(0, STORAGE_LIMIT - used);
}

export const db = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): { ok: boolean; error?: string } {
    const serialized = JSON.stringify(value);
    try {
      localStorage.setItem(PREFIX + key, serialized);
      return { ok: true };
    } catch {
      // Quota exceeded — try to free space by removing old data
      try {
        const keys: { key: string; size: number }[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(PREFIX) && k !== PREFIX + key) {
            const v = localStorage.getItem(k);
            keys.push({ key: k, size: v ? v.length : 0 });
          }
        }
        keys.sort((a, b) => b.size - a.size);
        for (let i = 0; i < Math.min(3, keys.length); i++) {
          localStorage.removeItem(keys[i].key);
        }
        localStorage.setItem(PREFIX + key, serialized);
        return { ok: true };
      } catch {
        return { ok: false, error: `Failed to save. Storage is full (${(estimateCurrentUsage() / 1024 / 1024).toFixed(1)}MB used). Try a smaller file or clear some data in Settings.` };
      }
    }
  },

  remove(key: string) {
    localStorage.removeItem(PREFIX + key);
  },

  clear() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  },

  getUsage(): { used: number; limit: number; percent: number } {
    const used = estimateCurrentUsage();
    return { used, limit: STORAGE_LIMIT, percent: Math.round((used / STORAGE_LIMIT) * 100) };
  }
};