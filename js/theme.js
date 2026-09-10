const KEY = 'pixel-portfolio:theme';

const currentTheme = () => (document.documentElement.dataset.theme === 'modern' ? 'modern' : 'pixel');

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  document.querySelectorAll('.theme-toggle__opt').forEach((el) => el.classList.toggle('is-on', el.dataset.value === theme));
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.setAttribute('aria-label', theme === 'pixel' ? 'Display mode: 240p. Switch to 4K' : 'Display mode: 4K. Switch to 240p');
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function flash() {
  const html = document.documentElement;
  html.classList.add('is-switching');
  setTimeout(() => html.classList.remove('is-switching'), 400);
}

export function initTheme() {
  setTheme(currentTheme());
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    flash();
    setTheme(currentTheme() === 'pixel' ? 'modern' : 'pixel');
  });
}
