# Contributing

Thanks for taking a look. This template has no build step and no dependencies, so the setup is short.

## Running locally

```bash
npm run serve
```

Opens http://localhost:5588. Opening `index.html` via `file://` does not work because the data is fetched.

## Before you open a pull request

- Run `npm run check`. It validates `data/portfolio.json` and must pass.
- Try both modes (240p and 4K) and both light and dark OS themes.
- Keep it dependency-free. If a change needs a library, open an issue first so we can talk about it.
- Keep the sample project generic. It is the example every new user sees.

## What fits here

- Bug fixes and accessibility improvements
- Rendering fixes in `js/markdown.js`
- Theme polish that keeps the existing CSS variables working
- Documentation in either README

Larger features such as new page types or a plugin system are better discussed in an issue before any code is written.

## Reporting bugs

Use the bug report template. A link to a public repo that reproduces the problem, or a minimal `portfolio.json`, saves a lot of back and forth.
