import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './db';

describe('db service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return fallback value if key does not exist', () => {
    const result = db.get<string>('non_existent', 'default_value');
    expect(result).toBe('default_value');
  });

  it('should save and retrieve values correctly', () => {
    const data = { name: 'Test User', age: 30 };
    const setRes = db.set('user_profile', data);
    expect(setRes.ok).toBe(true);

    const retrieved = db.get('user_profile', null);
    expect(retrieved).toEqual(data);
  });

  it('should remove items correctly', () => {
    db.set('temp', 'value');
    expect(db.get('temp', '')).toBe('value');

    db.remove('temp');
    expect(db.get('temp', 'removed')).toBe('removed');
  });

  it('should clear only prefixed items', () => {
    // Non-prefixed item
    localStorage.setItem('outside_key', 'outside');
    
    // Prefixed items
    db.set('key1', 'val1');
    db.set('key2', 'val2');

    db.clear();

    expect(db.get('key1', null)).toBeNull();
    expect(db.get('key2', null)).toBeNull();
    expect(localStorage.getItem('outside_key')).toBe('outside');
  });

  it('should report correct storage usage', () => {
    const usage = db.getUsage();
    expect(usage).toBeDefined();
    expect(usage.limit).toBe(50 * 1024 * 1024); // 50MB
    expect(usage.used).toBe(0);

    db.set('data', 'a'.repeat(100)); // ~102 bytes serialized with quotes
    const usage2 = db.getUsage();
    expect(usage2.used).toBeGreaterThan(100);
  });
});
