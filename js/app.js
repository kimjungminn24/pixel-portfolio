import { renderMarkdown, esc } from './markdown.js';
import { initTheme } from './theme.js';

const DATA_URL = 'data/portfolio.json';

const DEFAULT_LABELS = {
  nav_home: 'Home',
  nav_logs: 'Dev log',
  home: 'Home',
  repo: 'Repository',
  demo: 'Live site',
  stack: 'Stack',
  about: 'About',
  improvements: 'Improvements',
  logs: 'Dev log',
  all_logs: 'All dev logs',
  more: 'Read more',
  prev: 'Previous',
  next: 'Next',
  empty: 'Nothing here yet',
  not_found: 'Page not found',
  loading: 'Loading...',
  content_error: 'Could not load this content',
  load_error: 'Could not load the data. Opening via file:// does not work; run npm run serve.',
};

const app = document.getElementById('app');
const textCache = new Map();
let data;
let L = { ...DEFAULT_LABELS };
let renderSeq = 0;
let firstRender = true;

const enc = encodeURIComponent;

function link(href, text, cls = '') {
  const ext = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener"' : '';
  return `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}"${ext}>${esc(text)}</a>`;
}

function loadText(path) {
  if (!textCache.has(path)) {
    textCache.set(
      path,
      fetch(path)
        .then((r) => {
          if (!r.ok) throw new Error(`${r.status} ${path}`);
          return r.text();
        })
        .catch((err) => {
          textCache.delete(path);
          throw err;
        }),
    );
  }
  return textCache.get(path);
}

async function md(entry) {
  if (entry.file) return renderMarkdown(await loadText(entry.file));
  return renderMarkdown(entry.body ?? '');
}

/* routes: /, /logs, /p/:id, /p/:id/improve/:iid, /p/:id/log/:lid */

const BASE_PATH = new URL(document.baseURI).pathname;   // '/' or '/repo-name/'

function parseRoute() {
  const rel = location.pathname.startsWith(BASE_PATH) ? location.pathname.slice(BASE_PATH.length) : location.pathname.replace(/^\//, '');
  let parts;
  try {
    parts = rel.split('/').filter(Boolean).map(decodeURIComponent);
  } catch {
    return { name: '404' };   // bad percent-encoding
  }
  if (!parts.length) return { name: 'home' };
  if (parts[0] === 'logs' && parts.length === 1) return { name: 'logs' };
  if (parts[0] === 'p' && parts[1]) {
    if (parts.length === 2) return { name: 'project', id: parts[1] };
    if (parts.length === 4 && parts[2] === 'improve') return { name: 'improvement', id: parts[1], iid: parts[3] };
    if (parts.length === 4 && parts[2] === 'log') return { name: 'log', id: parts[1], lid: parts[3] };
  }
  return { name: '404' };
}

const findProject = (id) => data.projects.find((p) => p.id === id);
const logId = (l) => l.id ?? l.date;
const sortLogs = (logs) => [...logs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
const typeLabel = (p) => data.site.sections.find((s) => s.type === p.type)?.label ?? p.type;
const HOME = './';
const projectHref = (p) => `p/${enc(p.id)}`;   // relative to <base>
const improveHref = (p, it) => `p/${enc(p.id)}/improve/${enc(it.id)}`;
const logHref = (p, l) => `p/${enc(p.id)}/log/${enc(logId(l))}`;

/* pieces */

function thumb(p) {
  // 240p shows thumbnail_pixel instead when it exists (theme-pixel.css)
  if (p.thumbnail) return `<img class="thumb--main" src="${esc(p.thumbnail)}" alt="" loading="lazy">${p.thumbnail_pixel ? `<img class="thumb--pixel" src="${esc(p.thumbnail_pixel)}" alt="" loading="lazy">` : ''}`;
  return `<div class="thumb-fallback" aria-hidden="true">${esc((p.title || '?').trim().charAt(0))}</div>`;
}

const chips = (list) => (list?.length ? `<ul class="chips">${list.map((s) => `<li class="chip">${esc(s)}</li>`).join('')}</ul>` : '');

const crumbs = (items) =>
  `<nav class="crumbs" aria-label="Breadcrumb">${items
    .map(([text, href]) => (href ? link(href, text) : `<span>${esc(text)}</span>`))
    .join('<span aria-hidden="true">/</span>')}</nav>`;

function pager(prev, next) {
  if (!prev && !next) return '';
  const side = (item, label) =>
    item
      ? `<a href="${item.href}"><span class="pager__label">${esc(label)}</span><span class="pager__title">${esc(item.title)}</span></a>`
      : '<span></span>';
  return `<nav class="pager">${side(prev, L.prev)}${side(next, L.next)}</nav>`;
}

function card(p) {
  return `<a class="card" href="${projectHref(p)}">
    <div class="card__thumb thumb">${thumb(p)}</div>
    <div class="card__body">
      <h3 class="card__title">${esc(p.title)}</h3>
      <p class="card__summary">${esc(p.summary)}</p>
      ${chips(p.stack)}
      ${p.period ? `<div class="card__meta">${esc(p.period)}</div>` : ''}
    </div>
  </a>`;
}

function logItem(p, l) {
  return `<li>
    <a class="item" href="${logHref(p, l)}">
      <span class="item__date">${esc(l.date)}</span>
      <span class="item__main">
        <h3 class="item__title">${esc(l.title)}</h3>
        ${l.summary ? `<p class="item__summary">${esc(l.summary)}</p>` : ''}
      </span>
    </a>
  </li>`;
}

/* views */

function viewHome() {
  const s = data.site;
  const hero = `<section class="hero">
    ${s.avatar ? `<div class="hero__avatar thumb"><img class="avatar avatar--main" src="${esc(s.avatar)}" alt="">${s.avatar_pixel ? `<img class="avatar avatar--pixel" src="${esc(s.avatar_pixel)}" alt="">` : ''}</div>` : ''}
    <div>
      <h1 class="hero__name">${esc(s.owner)}</h1>
      ${s.tagline ? `<p class="hero__tagline">${esc(s.tagline)}</p>` : ''}
      ${s.intro ? `<p class="hero__intro">${esc(s.intro)}</p>` : ''}
      ${s.links?.length ? `<div class="hero__links">${s.links.map((l) => link(l.url, l.label, 'btn')).join('')}</div>` : ''}
    </div>
  </section>`;

  const sections = s.sections
    .map((sec) => {
      const items = data.projects.filter((p) => p.type === sec.type);
      return `<section class="section">
        <div class="section__head">
          <h2 class="section__title">${esc(sec.label)}</h2>
          <span class="section__count">${items.length}</span>
        </div>
        ${items.length ? `<div class="grid">${items.map(card).join('')}</div>` : `<p class="empty">${esc(L.empty)}</p>`}
      </section>`;
    })
    .join('');

  return { title: '', html: hero + sections };
}

async function viewProject(p) {
  const about = p.about || p.aboutFile ? await md({ body: p.about, file: p.aboutFile }) : '';
  const links = [
    p.repo && link(p.repo, L.repo, 'btn'),
    p.demo && link(p.demo, L.demo, 'btn btn--primary'),
    ...(p.links ?? []).map((l) => link(l.url, l.label, 'btn')),
  ]
    .filter(Boolean)
    .join('');

  const improvements = (p.improvements ?? [])
    .map(
      (it, i) => `<li>
      <a class="item" href="${improveHref(p, it)}">
        <span class="item__no">${String(i + 1).padStart(2, '0')}</span>
        <span class="item__main">
          <h3 class="item__title">${esc(it.title)}</h3>
          ${it.summary ? `<p class="item__summary">${esc(it.summary)}</p>` : ''}
        </span>
        <span class="item__more">${esc(L.more)}</span>
      </a>
    </li>`,
    )
    .join('');
  const logs = sortLogs(p.logs ?? []).map((l) => logItem(p, l)).join('');

  const html = `
    ${crumbs([[L.home, HOME], [p.title]])}
    <header class="project-head">
      <h1>${esc(p.title)}</h1>
      ${p.summary ? `<p class="project-head__lead">${esc(p.summary)}</p>` : ''}
      <div class="project-head__meta">
        <span class="badge">${esc(typeLabel(p))}</span>
        ${p.period ? `<span>${esc(p.period)}</span>` : ''}
        ${p.role ? `<span>${esc(p.role)}</span>` : ''}
      </div>
    </header>
    ${p.thumbnail ? `<div class="project-hero thumb"><img class="thumb--main" src="${esc(p.thumbnail)}" alt="">${p.thumbnail_pixel ? `<img class="thumb--pixel" src="${esc(p.thumbnail_pixel)}" alt="">` : ''}</div>` : ''}
    ${links ? `<div class="project-links">${links}</div>` : ''}
    ${p.stack?.length ? `<section class="block"><h2 class="block__title">${esc(L.stack)}</h2>${chips(p.stack)}</section>` : ''}
    ${about ? `<section class="block"><h2 class="block__title">${esc(L.about)}</h2><div class="prose">${about}</div></section>` : ''}
    <section class="block">
      <h2 class="block__title">${esc(L.improvements)}</h2>
      ${improvements ? `<ol class="list">${improvements}</ol>` : `<p class="empty">${esc(L.empty)}</p>`}
    </section>
    <section class="block">
      <h2 class="block__title">${esc(L.logs)}</h2>
      ${logs ? `<ul class="list">${logs}</ul>` : `<p class="empty">${esc(L.empty)}</p>`}
    </section>`;
  return { title: p.title, html };
}

async function viewImprovement(p, it) {
  const list = p.improvements;
  const idx = list.indexOf(it);
  const body = await md(it);
  const metrics = it.metrics?.length
    ? `<div class="metrics">${it.metrics
        .map(
          (m) => `<div class="metric">
        <div class="metric__label">${esc(m.label)}</div>
        <div class="metric__vals">
          ${m.before != null ? `<span class="metric__before">${esc(m.before)}</span>` : ''}
          <span class="metric__after">${esc(m.after)}</span>
        </div>
      </div>`,
        )
        .join('')}</div>`
    : '';
  const nav = (x) => x && { href: improveHref(p, x), title: x.title };

  const html = `
    ${crumbs([[L.home, HOME], [p.title, projectHref(p)], [L.improvements]])}
    <header class="article-head">
      <h1>${esc(it.title)}</h1>
      ${it.summary ? `<p class="article-head__meta">${esc(it.summary)}</p>` : ''}
      ${chips(it.tags)}
    </header>
    ${metrics}
    <article class="prose">${body}</article>
    ${pager(nav(list[idx - 1]), nav(list[idx + 1]))}`;
  return { title: `${it.title} - ${p.title}`, html };
}

async function viewLog(p, l) {
  const list = sortLogs(p.logs);
  const idx = list.indexOf(l);
  const body = await md(l);
  const nav = (x) => x && { href: logHref(p, x), title: `${x.date} ${x.title}` };

  const html = `
    ${crumbs([[L.home, HOME], [p.title, projectHref(p)], [L.logs]])}
    <header class="article-head">
      <h1>${esc(l.title)}</h1>
      <p class="article-head__meta"><time datetime="${esc(l.date)}">${esc(l.date)}</time>${l.summary ? `, ${esc(l.summary)}` : ''}</p>
      ${chips(l.tags)}
    </header>
    <article class="prose">${body}</article>
    ${pager(nav(list[idx + 1]), nav(list[idx - 1]))}`;
  return { title: `${l.title} - ${p.title}`, html };
}

function viewLogs() {
  const groups = data.projects
    .filter((p) => p.logs?.length)
    .map(
      (p) => `<section class="log-group">
      <h2 class="log-group__title"><a href="${projectHref(p)}">${esc(p.title)}</a></h2>
      <ul class="list">${sortLogs(p.logs).map((l) => logItem(p, l)).join('')}</ul>
    </section>`,
    )
    .join('');
  const html = `
    ${crumbs([[L.home, HOME], [L.all_logs]])}
    <header class="article-head"><h1>${esc(L.all_logs)}</h1></header>
    ${groups || `<p class="empty">${esc(L.empty)}</p>`}`;
  return { title: L.all_logs, html };
}

const view404 = () => ({
  title: L.not_found,
  html: `<section class="notfound">
    <p class="notfound__code">404</p>
    <p class="notfound__text">${esc(L.not_found)}</p>
    <p>${link(HOME, L.home, 'btn')}</p>
  </section>`,
});

function resolve(route) {
  const p = route.id && findProject(route.id);
  switch (route.name) {
    case 'home':
      return viewHome();
    case 'logs':
      return viewLogs();
    case 'project':
      return p ? viewProject(p) : view404();
    case 'improvement': {
      const it = p?.improvements?.find((x) => x.id === route.iid);
      return it ? viewImprovement(p, it) : view404();
    }
    case 'log': {
      const l = p?.logs?.find((x) => logId(x) === route.lid);
      return l ? viewLog(p, l) : view404();
    }
    default:
      return view404();
  }
}

function setNav(route) {
  document.querySelectorAll('#site-nav a').forEach((a) => {
    if (a.dataset.nav === route.name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

async function render({ keepScroll = false } = {}) {
  const seq = ++renderSeq;
  const route = parseRoute();
  setNav(route);
  const spinner = setTimeout(() => {
    app.innerHTML = `<p class="loading">${esc(L.loading)}</p>`;
  }, 200);

  let out;
  try {
    out = await resolve(route);
  } catch (err) {
    console.error(err);
    out = { title: '', html: `<p class="error">${esc(L.content_error)}</p>` };
  }
  clearTimeout(spinner);
  if (seq !== renderSeq) return;

  app.innerHTML = out.html;
  document.title = out.title ? `${out.title} - ${data.site.title}` : data.site.title;
  if (!keepScroll) window.scrollTo(0, 0);
  if (!firstRender) app.focus({ preventScroll: true });
  firstRender = false;
}

async function main() {
  initTheme();
  try {
    const r = await fetch(DATA_URL);
    if (!r.ok) throw new Error(`${r.status} ${DATA_URL}`);
    data = await r.json();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<p class="error">${esc(L.load_error)}</p>`;
    document.dispatchEvent(new Event('portfolio:ready'));
    return;
  }
  L = { ...DEFAULT_LABELS, ...(data.labels ?? {}) };

  document.title = data.site.title;
  document.getElementById('site-logo').textContent = data.site.title;
  document.querySelector('[data-nav="home"]').textContent = L.nav_home;
  document.querySelector('[data-nav="logs"]').textContent = L.nav_logs;
  document.getElementById('site-footer').innerHTML = data.site.footer ? renderMarkdown(data.site.footer) : '';
  document.dispatchEvent(new Event('portfolio:ready'));   // boot.js waits for this

  // 404.html sends unknown paths here as ?r=/path
  const back = new URLSearchParams(location.search).get('r');
  if (back) history.replaceState(null, '', BASE_PATH.replace(/\/$/, '') + (back.startsWith('/') ? back : `/${back}`));
  window.addEventListener('popstate', () => render({ keepScroll: true }));
  // in-site links render without a reload. href="#id" would resolve against <base>, so anchors are handled here too
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const raw = a.getAttribute('href');
    if (raw.startsWith('#')) {
      const el = document.getElementById(raw.slice(1));
      if (!el) return;
      e.preventDefault();
      if (!el.hasAttribute('tabindex')) el.tabIndex = -1;
      el.focus();
      el.scrollIntoView();
      return;
    }
    const url = new URL(a.href);
    if (url.origin !== location.origin || !url.pathname.startsWith(BASE_PATH)) return;
    e.preventDefault();
    if (url.href !== location.href) history.pushState(null, '', url.href);
    render();
  });
  render();
}

main();
