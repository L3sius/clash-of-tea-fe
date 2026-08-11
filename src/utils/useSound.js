// Auto-discovers whatever sound files exist in src/assets/sounds at build
// time - drop a file in, it's picked up automatically, no code changes needed.
const soundModules = import.meta.glob('/src/assets/sounds/*.{mp3,wav,ogg,flac}', {
    eager: true,
    query: '?url',
    import: 'default',
});

const soundUrls = Object.values(soundModules);

// Fire-and-forget. Browsers block audio autoplay before any user interaction
// on the page, so play() can reject (e.g. right after page load) - that's
// expected and safely ignored rather than surfaced as an error.
export function playRandomUpgradeSound() {
    if (soundUrls.length === 0) return;
    const url = soundUrls[Math.floor(Math.random() * soundUrls.length)];
    new Audio(url).play().catch(() => { });
}
