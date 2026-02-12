---
name: Generate Icons
description: Generate PWA icons from a base SVG using sharp
tags: [pwa, icons, sharp, assets]
---

# Generate Icons — Create PWA Assets

## Purpose
Generate the required PWA icons (PNGs of various sizes) from the source `public/icon.svg` file using the `scripts/generate-icons.js` script.

## Triggers
Invoke this skill when the user/agent:
- Updates the main `public/icon.svg`
- Reports missing icons in the PWA manifest
- Changes the icon generation logic

## Execution environment
Runs **inside the Docker container** to ensure the `sharp` library (which depends on platform-specific binaries) works correctly.

```bash
docker compose exec app <command>
```

## Steps

### 1. Verify container is running
If not, start it using `dev-server.md`.

### 2. Run the generation script
```bash
docker compose exec app npm run generate-icons
```
This executes `node scripts/generate-icons.js`.

### 3. Verify output
Check if the icons were created in `public/icons/`.
```bash
ls -la public/icons/
```
Expected output:
- `icon-192.png`
- `icon-512.png`
- ...and others depending on script config

## Output format
Report to the user:
- ✅ **Generated**: List of icons created
- ⚠️ **Errors**: Any issues with the source SVG or `sharp` library

## Related skills
- [dev-server.md](dev-server.md) — container required
