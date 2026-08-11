# Upgrade sounds

Drop `.mp3`, `.wav`, or `.ogg` files in this folder to have them play when any
team upgrades a building (broadcast via `getBuildingUpgradeStream` to everyone
with the Map page open).

- One is picked at random with equal chance among however many files exist
  here — no code changes needed to add, remove, or rename files.
- See `src/utils/useSound.js` for the playback logic.
