## Problem

The first screen waited for fonts, then data, then render, one after another. On a slow network that was almost two seconds of blank page.

## Cause

- The font CSS in `<head>` was blocking render
- The data request only started after the script ran

## What changed

1. Fonts only get a `preconnect` and are not awaited (`font-display: swap`)
2. The data request now starts while the script is still parsing
3. An unused icon set was removed to cut transfer size

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net">
```

## Result

The numbers above come from the `metrics` field. Before and after values side by side make the change easy to see.

## Still to do

- Convert thumbnails to WebP
- Prefetch markdown per route
