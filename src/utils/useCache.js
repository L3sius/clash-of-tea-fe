const CACHE_PREFIX = 'osrs_map_';

/**
 * Reusable cache utility wrapping localStorage.
 * All keys are automatically namespaced with CACHE_PREFIX
 * to avoid collisions with other apps or browser extensions.
 *
 * Usage:
 *   import { cacheSet, cacheGet, cacheClear } from '@/utils/useCache';
 *
 *   cacheSet('selectedTeamId', 3);
 *   cacheGet('selectedTeamId');        // 3
 *   cacheGet('selectedTeamId', 1);     // falls back to 1 if not set
 *   cacheClear('selectedTeamId');      // removes one key
 *   cacheClear();                      // wipes all osrs_map_ keys
 */

export function cacheSet(key, value) {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
        console.warn(`[useCache] Failed to set "${key}":`, e);
    }
}

export function cacheGet(key, fallback = null) {
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch (e) {
        console.warn(`[useCache] Failed to get "${key}":`, e);
        return fallback;
    }
}

export function cacheClear(key) {
    try {
        if (key) {
            localStorage.removeItem(CACHE_PREFIX + key);
        } else {
            // Wipe every key that belongs to this app
            Object.keys(localStorage)
                .filter(k => k.startsWith(CACHE_PREFIX))
                .forEach(k => localStorage.removeItem(k));
        }
    } catch (e) {
        console.warn(`[useCache] Failed to clear "${key ?? 'all'}":`, e);
    }
}