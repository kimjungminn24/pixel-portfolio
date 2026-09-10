<div align="center">

# pixel-portfolio

**English** | [한국어](README.ko.md)

A pixel-art portfolio template. One JSON file and a few markdown pages become a project gallery, improvement write-ups and a dev log. One button switches the whole site between **240p** and **4K**.

[Live demo](https://kimjungminn24.github.io/pixel-portfolio/)

</div>

## Features

- No build step, no dependencies. Any static host works
- **240p**: pixel font (Galmuri), hard shadows, scanlines, pixel cursor. White on black when the OS is in dark mode
- **4K**: Pretendard, rounded corners, soft shadows
- The chosen mode is saved in the browser
- Boot screen in 240p, once per session. Any key or click skips it. Not shown in 4K or with reduced motion
- Every UI string can be changed from the JSON, so the site works in any language

| Page | Route |
| --- | --- |
| Home: intro and cards grouped by section | `/` |
| Project: thumbnail, links, stack, about, improvements, dev log | `/p/:id` |
| Improvement: before/after metrics and markdown body | `/p/:id/improve/:id` |
| Log entry: markdown body | `/p/:id/log/:date` |
| All logs | `/logs` |

## Getting started

1. Click **Use this template** or fork the repo
2. Edit `data/portfolio.json`
3. Write markdown under `content/<project id>/`
4. Put thumbnails in `assets/thumbs/`
5. Check locally

   ```
   npm run serve     # http://127.0.0.1:5588/
   npm run check     # validates the JSON
   ```

6. In the repo settings open **Pages** and set Source to **GitHub Actions**. Every push to `main` deploys

Node is only needed for the two scripts. The site itself is plain HTML, CSS and JS.

## Data

Everything lives in `data/portfolio.json`.

```jsonc
{
  "site": {
    "title": "Pixel Portfolio",          // tab title and logo
    "owner": "Your Name",
    "tagline": "one line",
    "intro": "a few lines",
    "avatar": "assets/avatar.svg",
    "avatar_pixel": "assets/avatar-pixel.svg",   // optional, shown in 240p instead of avatar
    "links": [{ "label": "GitHub", "url": "https://github.com/..." }],
    "sections": [                         // home sections; type groups projects
      { "type": "project", "label": "Projects" },
      { "type": "opensource", "label": "Open source" }
    ],
    "footer": "markdown allowed"
  },
  "labels": { "nav_home": "Home", "more": "Read more" },   // optional, see below
  "projects": [ /* below */ ]
}
```

One project:

```jsonc
{
  "id": "my-app",                       // used in URLs: letters, digits, hyphens
  "type": "project",                    // one of site.sections[].type
  "title": "My App",
  "summary": "one line shown on the card",
  "thumbnail": "assets/thumbs/my-app.png",         // omit to get a letter placeholder
  "thumbnail_pixel": "assets/thumbs/my-app-px.png", // optional, shown in 240p instead of thumbnail
  "repo": "https://github.com/...",
  "demo": "https://...",
  "links": [{ "label": "Slides", "url": "..." }],   // optional
  "stack": ["Go", "React"],
  "period": "2026.07 ~ 2026.08",
  "role": "solo",
  "about": "short markdown",            // or "aboutFile": "content/my-app/about.md"
  "improvements": [
    {
      "id": "faster-boot",
      "title": "Cut first paint",
      "summary": "one line for the list",
      "tags": ["perf"],
      "metrics": [{ "label": "First paint", "before": "1.8s", "after": "0.6s" }],   // optional
      "file": "content/my-app/improvements/faster-boot.md"   // or "body": "markdown"
    }
  ],
  "logs": [
    { "date": "2026-09-10", "title": "First deploy", "summary": "...", "tags": [], "file": "content/my-app/logs/2026-09-10.md" }
  ]
}
```

- Log URLs use `date`. Give an explicit `id` if two entries share a day
- Use either `file` or `body`, not both
- The `sample` project has every field filled in. Read it, then delete it

Labels you can override: `nav_home`, `nav_logs`, `home`, `repo`, `demo`, `stack`, `about`, `improvements`, `logs`, `all_logs`, `more`, `prev`, `next`, `empty`, `not_found`, `loading`, `content_error`, `load_error`.

## Markdown

`js/markdown.js` renders headings, bold, italic, strikethrough, `==highlight==`, inline code, fenced code, lists, ordered lists, blockquotes, tables, rules, links and images.

Not supported: nested lists, raw HTML (tags show as text), bare URLs (write `[text](url)`). An unclosed code fence runs to the end of the file.

## Theming

| File | Role |
| --- | --- |
| `css/base.css` | Layout, shared by both themes |
| `css/theme-pixel.css` | 240p variables and decorations |
| `css/theme-modern.css` | 4K variables and decorations |

Colors, fonts, radii and shadows are CSS variables at the top of each theme file. The 240p corner tile is the `--corner` SVG in the same block. Its `fill` is a literal color, so change it together with `--ink`.

Add `?theme=pixel` or `?theme=modern` to any URL to open that visit in a given mode.

To remove the boot screen, delete the `js/boot.js` line in `index.html`.

## Hosting

Routes are real paths such as `/p/sample`, so the host has to serve `index.html` for paths it does not know.

- **GitHub Pages**: done. `404.html` bounces unknown paths back to the app, and the workflow sets `<base href>` for project sites
- **Netlify, Vercel, Cloudflare Pages**: add a rewrite from `/*` to `/index.html`
- **Sub folder on another host**: set `<base href>` in `index.html` and `404.html` to that folder
- `file://` does not work because the data is fetched. Use `npm run serve`

Fonts load from the jsdelivr CDN and fall back to system fonts if it is unreachable.

## Files

```
index.html
404.html      redirect for GitHub Pages
css/          base, theme-pixel, theme-modern
js/           app (router and views), markdown, theme, boot
data/         portfolio.json
content/      <project id>/about.md, improvements/*.md, logs/*.md
assets/       thumbs/, avatar.svg, avatar-pixel.svg, favicon.svg
scripts/      serve.js, check.js
```

## Contributing

Bug reports and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
